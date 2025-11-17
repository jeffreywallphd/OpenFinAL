import joblib
import pandas as pd
from xgboost import XGBClassifier

from nltk.stem import WordNetLemmatizer
from sklearn.preprocessing import LabelEncoder
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
#lemmitization hardly created an impact but is a good practice
def lemmatize_text(text):
    lemmatizer = WordNetLemmatizer()
    return ' '.join([lemmatizer.lemmatize(word) for word in text.split()])
data = pd.read_excel(r"AutoProphet_KB.xlsx") 
data['Query'] = data['Query'].apply(lemmatize_text)

# label_encoder = LabelEncoder()
# data['Intent'] = label_encoder.fit_transform(data['Intent'])
# Split data
X = data['Query']
y = data['Intent']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
# model = make_pipeline(TfidfVectorizer(), XGBClassifier(use_label_encoder=False, eval_metric='logloss'))

# model = make_pipeline(TfidfVectorizer(), LogisticRegression()) #logistic gave accuracy 0.91
model = make_pipeline(TfidfVectorizer(), MultinomialNB())   #Naive Bayes gave accuracy 0.84, in case of random_state 25, gave 0.58

#model = make_pipeline(TfidfVectorizer(), RandomForestClassifier()) #0.9

print(model)
# Train the model
model.fit(X_train, y_train)

# Predict and evaluate
y_pred = model.predict(X_test)
joblib.dump(model, 'intent_model.pkl')

# print(y_pred)
print(confusion_matrix(y_test, y_pred)) 
print(classification_report(y_test, y_pred))
