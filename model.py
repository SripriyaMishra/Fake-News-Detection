import os
import re
import pickle
import pandas as pd
import nltk

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import PassiveAggressiveClassifier, LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score
)

# ---------------------------------------------------------
# DOWNLOAD NLTK DATA
# ---------------------------------------------------------

print("=" * 60)
print("FAKE NEWS DETECTOR - MODEL TRAINING")
print("=" * 60)

print("\n[1/6] Downloading NLTK resources...")

nltk.download("stopwords", quiet=True)
nltk.download("wordnet", quiet=True)
nltk.download("punkt", quiet=True)
nltk.download("omw-1.4", quiet=True)

print("✓ NLTK resources ready.")

# ---------------------------------------------------------
# LOAD DATASETS
# ---------------------------------------------------------

print("\n[2/6] Loading datasets...")

fake_path = os.path.join("dataset", "Fake.csv")
true_path = os.path.join("dataset", "True.csv")

fake_df = pd.read_csv(fake_path)
true_df = pd.read_csv(true_path)

# Add labels
fake_df["label"] = 0
true_df["label"] = 1

# Combine datasets
df = pd.concat([fake_df, true_df], axis=0)

# Shuffle dataset
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# Combine title + text
df["content"] = (
    df["title"].fillna("") + " " + df["text"].fillna("")
).str.strip()

# Keep required columns
df = df[["content", "label"]]

print(f"✓ Total articles loaded: {len(df)}")

print("\nLabel Distribution:")
print(df["label"].value_counts())

# ---------------------------------------------------------
# TEXT PREPROCESSING
# ---------------------------------------------------------

print("\n[3/6] Cleaning and preprocessing text...")

lemmatizer = WordNetLemmatizer()

stop_words = set(stopwords.words("english"))

# Keep important negation words
keep_words = {
    "not",
    "no",
    "never",
    "nor",
    "neither",
    "without",
    "fake",
    "false"
}

stop_words = stop_words - keep_words


def clean_text(text):

    text = str(text).lower()

    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)

    # Remove HTML
    text = re.sub(r"<.*?>", " ", text)

    # Remove special characters
    text = re.sub(r"[^a-z\s]", " ", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()

    tokens = []

    for word in text.split():

        if word not in stop_words and len(word) > 1:

            word = lemmatizer.lemmatize(word)

            tokens.append(word)

    return " ".join(tokens)


df["cleaned"] = df["content"].apply(clean_text)

print("✓ Text preprocessing completed.")

# ---------------------------------------------------------
# TF-IDF VECTORIZATION
# ---------------------------------------------------------

print("\n[4/6] Building TF-IDF vectors...")

vectorizer = TfidfVectorizer(
    max_features=15000,
    ngram_range=(1, 2),
    min_df=2,
    max_df=0.9,
    sublinear_tf=True
)

X = vectorizer.fit_transform(df["cleaned"])

y = df["label"]

print(f"✓ Feature matrix shape: {X.shape}")

# ---------------------------------------------------------
# TRAIN TEST SPLIT
# ---------------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ---------------------------------------------------------
# TRAIN MODELS
# ---------------------------------------------------------

print("\n[5/6] Training models...")

# Passive Aggressive Classifier
pac = PassiveAggressiveClassifier(
    max_iter=1000,
    random_state=42,
    C=0.5
)

pac.fit(X_train, y_train)

pac_pred = pac.predict(X_test)

pac_acc = accuracy_score(y_test, pac_pred)

pac_f1 = f1_score(y_test, pac_pred, average="weighted")

# Logistic Regression
lr = LogisticRegression(
    max_iter=1000,
    random_state=42
)

lr.fit(X_train, y_train)

lr_pred = lr.predict(X_test)

lr_acc = accuracy_score(y_test, lr_pred)

lr_f1 = f1_score(y_test, lr_pred, average="weighted")

# Select best model
if lr_acc >= pac_acc:

    model = lr
    model_type = "Logistic Regression"
    best_acc = lr_acc
    best_pred = lr_pred

else:

    model = pac
    model_type = "Passive Aggressive Classifier"
    best_acc = pac_acc
    best_pred = pac_pred

# ---------------------------------------------------------
# RESULTS
# ---------------------------------------------------------

print("\nMODEL RESULTS")
print("-" * 40)

print(f"PassiveAggressive Accuracy : {pac_acc * 100:.2f}%")
print(f"PassiveAggressive F1 Score : {pac_f1:.4f}")

print(f"\nLogistic Regression Accuracy : {lr_acc * 100:.2f}%")
print(f"Logistic Regression F1 Score : {lr_f1:.4f}")

print(f"\n✓ Selected Model: {model_type}")
print(f"✓ Best Accuracy : {best_acc * 100:.2f}%")

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, best_pred))

print("\nClassification Report:")
print(classification_report(y_test, best_pred))

# ---------------------------------------------------------
# SAVE MODEL
# ---------------------------------------------------------

print("\n[6/6] Saving model files...")

model_data = {
    "model": model,
    "model_type": model_type,
    "accuracy": float(best_acc * 100),
    "pac_acc": float(pac_acc * 100),
    "lr_acc": float(lr_acc * 100),
    "total_train": int(len(y_train)),
    "total_test": int(len(y_test))
}

with open("fake_news_model.pkl", "wb") as f:
    pickle.dump(model_data, f)

with open("vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("✓ fake_news_model.pkl saved.")
print("✓ vectorizer.pkl saved.")

print("\n" + "=" * 60)
print(f"TRAINING COMPLETED SUCCESSFULLY")
print(f"Final Accuracy: {best_acc * 100:.2f}%")
print("=" * 60)

print("\nRun your website using:")
print("python app.py")