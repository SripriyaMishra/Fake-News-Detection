# TruthLens AI — Fake News Detection System

TruthLens AI is an AI-powered Fake News Detection web application that analyzes news headlines and articles using Machine Learning and Natural Language Processing (NLP).

The project uses TF-IDF Vectorization and a Passive Aggressive Classifier trained on real and fake news datasets from Kaggle to classify news content as REAL or FAKE.

---

## Features

- AI-powered fake news detection
- Machine Learning + NLP based classification
- Real-time prediction confidence scores
- Editorial-style modern UI
- Smooth animations and interactive frontend
- Model performance dashboard
- Text-to-speech support
- Fast Flask backend integration

---

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Flask (Python)

### Machine Learning / NLP
- scikit-learn
- TF-IDF Vectorizer
- Passive Aggressive Classifier
- NLTK
- Pandas
- NumPy

---

## Dataset

Dataset used:
- Fake.csv
- True.csv

Source:
Kaggle Fake and Real News Dataset

---

## Machine Learning Workflow

1. Data Collection
2. Data Cleaning & Preprocessing
3. Text Vectorization using TF-IDF
4. Model Training using Passive Aggressive Classifier
5. Model Evaluation
6. Flask API Integration
7. Frontend Prediction Rendering

---

## Model Accuracy

- Accuracy Achieved: ~99%
- Binary Classification:
  - REAL News
  - FAKE News

---

## Project Preview

### Home Interface
Modern editorial-inspired interface with animated UI and live news analysis.

### Prediction System
Displays:
- Prediction Result
- Confidence Score
- Real vs Fake Probability
- News Category
- Reasoning Output

---

## How to Run the Project

### 1. Clone Repository

```bash
git clone https://github.com/SripriyaMishra/Fake-News-Detection.git
```

### 2. Open Project Folder

```bash
cd Fake News Detector
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Train the Model

```bash
python model.py
```

### 5. Run Flask Server

```bash
python app.py
```

### 6. Open Browser

```text
http://127.0.0.1:5000
```

---

## Project Structure

```bash
Fake News Detector
│
├── dataset/
│   ├── Fake.csv
│   └── True.csv
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   └── script.js
│
├── templates/
│   └── index.html
│
├── app.py
├── model.py
├── requirements.txt
```

---

## Future Improvements

- BERT / Transformer integration
- Live news API support
- Multi-language fake news detection
- AI explanation system
- User authentication
- Deployable cloud version

---

## Author

Sripriya Mishra

Built using Machine Learning, NLP, Flask, and modern web technologies.

---

## Acknowledgements

- Kaggle Dataset Contributors
- scikit-learn Documentation
- Flask Documentation
- NLTK Library
