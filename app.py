import os
import re
import pickle
import numpy as np
from flask import Flask, render_template, request, jsonify
 
# ── Try NLTK (optional, graceful fallback) ────────────────────
try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.stem import WordNetLemmatizer
    nltk.download("stopwords", quiet=True)
    nltk.download("wordnet",   quiet=True)
    nltk.download("punkt",     quiet=True)
    nltk.download("omw-1.4",   quiet=True)
    _lemmatizer = WordNetLemmatizer()
    _nltk_stops = set(stopwords.words("english"))
    _NLTK_OK = True
except Exception:
    _NLTK_OK = False
 
# ── Fallback stopword list ────────────────────────────────────
_FALLBACK_STOPS = set(
    "a an the is are was were be been being have has had do does did "
    "will would could should may might shall can need dare ought used to "
    "i me my we us our you your he him his she her it its they them their "
    "what which who whom this that these those am at by for in of on with "
    "as into through during before after above below to from up down out "
    "off over under again further then once here there when where why how "
    "all both each few more most other some such no nor not only own same "
    "so than too very just because".split()
)
 
_KEEP = {"not", "no", "never", "nor", "neither", "without", "false", "fake"}
 
if _NLTK_OK:
    _stop_words = _nltk_stops - _KEEP
else:
    _stop_words = _FALLBACK_STOPS - _KEEP
 
 
def clean_text(text: str) -> str:
    """Preprocess text for vectorisation."""
    text = str(text).lower()
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"<[^>]+>",               " ", text)
    text = re.sub(r"[^a-z\s]",              " ", text)
    text = re.sub(r"\s+",                   " ", text).strip()
 
    if _NLTK_OK:
        tokens = [_lemmatizer.lemmatize(t)
                  for t in text.split()
                  if t not in _stop_words and len(t) > 1]
    else:
        tokens = [t for t in text.split()
                  if t not in _stop_words and len(t) > 1]
 
    return " ".join(tokens)
 
 
# ── Flask app ─────────────────────────────────────────────────
app = Flask(__name__)
 
# ── Session counters ──────────────────────────────────────────
_session = {"real": 0, "fake": 0, "total": 0}
 
 
def load_artefacts():
    for p in ("fake_news_model.pkl", "vectorizer.pkl"):
        if not os.path.exists(p):
            raise FileNotFoundError(f"{p} not found. Run: python model.py")
    with open("fake_news_model.pkl", "rb") as f:
        meta = pickle.load(f)
    with open("vectorizer.pkl", "rb") as f:
        vec = pickle.load(f)
    return meta, vec
 
 
try:
    model_meta, vectorizer = load_artefacts()
    model = model_meta["model"]
    print(f"[√] {model_meta['model_type']} loaded – Acc {model_meta['accuracy']}%")
except FileNotFoundError as e:
    model_meta = vectorizer = model = None
    print(f"[!] {e}")
 
 
# ── Keyword signals ───────────────────────────────────────────
_REAL_KWS = ["published in", "peer-reviewed", "study finds", "researchers",
             "according to", "confirmed by", "data shows", "experts say",
             "university", "journal", "official statement", "scientists"]
_FAKE_KWS = ["share before deleted", "mainstream media hiding",
             "what they dont want you", "wake up", "exposed", "globalist",
             "deep state", "illuminati", "theyre lying", "secret suppressed",
             "whistleblower", "big pharma", "shocking truth",
             "you wont believe", "breaking exclusive", "shadow government",
             "satanic", "mind control", "conspiracy"]
 
 
def get_reasoning(text: str, prediction: str, confidence: float) -> str:
    tl = text.lower()
    rh = [s for s in _REAL_KWS if s in tl]
    fh = [s for s in _FAKE_KWS if s in tl]
    words = len(text.split())
    cs = f"{confidence:.1f}%"
    if prediction == "REAL":
        base = (f"The model classified this as REAL news with {cs} confidence. "
                f"The article ({words} words) exhibits patterns common in credible reporting.")
        if rh:
            base += f" Credibility markers detected: '{rh[0]}'"
            if len(rh) > 1:
                base += f" and {len(rh)-1} more"
            base += "."
        if fh:
            base += (f" Note: {len(fh)} sensationalist phrase(s) present "
                     "but outweighed by credibility signals.")
    else:
        base = (f"The model classified this as FAKE news with {cs} confidence. "
                f"The text ({words} words) exhibits patterns associated with misinformation.")
        if fh:
            base += f" Misinformation markers detected: '{fh[0]}'"
            if len(fh) > 1:
                base += f" and {len(fh)-1} more"
            base += "."
        if rh:
            base += (f" Despite {len(rh)} seemingly credible phrase(s), "
                     "the overall linguistic pattern matches fabricated content.")
    return base
 
 
def get_category(text: str) -> str:
    tl = text.lower()
    cats = {
        "Politics":  ["government","president","senate","election","congress","vote","democrat","republican"],
        "Science":   ["research","study","scientists","university","nasa","discovery","experiment","journal"],
        "Health":    ["vaccine","health","medical","hospital","disease","drug","virus","treatment","cancer"],
        "Technology":["technology","ai","software","google","apple","microsoft","startup","digital"],
        "Economy":   ["stock","market","economy","gdp","inflation","federal reserve","bank","trade"],
        "Climate":   ["climate","carbon","temperature","sea level","emissions","renewable","glacier"],
        "World":     ["international","united nations","treaty","war","conflict","global","foreign"],
    }
    scores = {c: sum(1 for k in ks if k in tl) for c, ks in cats.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "General"
 
 
# ── Routes ────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")
 
 
@app.route("/predict", methods=["POST"])
def predict():

    if model is None:
        return jsonify({
            "error": "Model not loaded. Run: python model.py"
        }), 503

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Invalid JSON body."
        }), 400

    text = data.get("text", "").strip()

    if not text:
        return jsonify({
            "error": "Please provide non-empty text."
        }), 400

    if len(text) > 10000:
        return jsonify({
            "error": "Text too long."
        }), 400

    # Clean text
    cleaned = clean_text(text)

    # Vectorize
    features = vectorizer.transform([cleaned])

    # Predict
    prediction = int(model.predict(features)[0])

    # Convert numeric prediction to label
    if prediction == 1:
        pred = "REAL"
    else:
        pred = "FAKE"

    # Confidence
    if hasattr(model, "predict_proba"):

        probabilities = model.predict_proba(features)[0]

        confidence = float(max(probabilities) * 100)

        classes = list(model.classes_)

        real_index = classes.index(1)
        fake_index = classes.index(0)

        breakdown = {
            "REAL": round(float(probabilities[real_index] * 100), 1),
            "FAKE": round(float(probabilities[fake_index] * 100), 1)
        }

    else:

        decision = float(model.decision_function(features)[0])

        confidence = min(50 + abs(decision) * 22, 99.5)

        if pred == "REAL":

            breakdown = {
                "REAL": round(confidence, 1),
                "FAKE": round(100 - confidence, 1)
            }

        else:

            breakdown = {
                "FAKE": round(confidence, 1),
                "REAL": round(100 - confidence, 1)
            }

    # Extra info
    reasoning = get_reasoning(text, pred, confidence)

    category = get_category(text)

    # Session stats
    _session["total"] += 1

    if pred == "REAL":
        _session["real"] += 1
    else:
        _session["fake"] += 1

    # Final response
    return jsonify({
        "prediction": pred,
        "confidence": round(float(confidence), 1),
        "breakdown": breakdown,
        "reasoning": reasoning,
        "category": category,
        "word_count": int(len(text.split())),
        "is_real": bool(pred == "REAL")
    })
 
 
@app.route("/stats")
def stats():

    return jsonify({

        "model_type": "Passive Aggressive Classifier",

        "accuracy": 99.8,

        "pac_accuracy": 99.8,

        "lr_accuracy": 99.2,

        "train_size": 35916,

        "test_size": 8979,

        "session": {

            "real": int(_session["real"]),

            "fake": int(_session["fake"]),

            "total": int(_session["total"])

        }

    })
 
 
@app.route("/health")
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})
 
 
if __name__ == "__main__":
    app.run(debug=True, port=5000)