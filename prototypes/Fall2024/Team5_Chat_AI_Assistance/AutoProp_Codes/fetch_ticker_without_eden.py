#https://www.kaggle.com/datasets/paultimothymooney/stock-market-supplementary-data
import pandas as pd
import requests
from dotenv import load_dotenv
import os
import nltk

from nltk.corpus import stopwords
# nltk.download('stopwords')

def get_company_ticker(query, csv_file="nasdaq.csv"):
  stock_data = pd.read_csv(csv_file)
  query = query.lower()
  exclude_words = set(stopwords.words('english')) | {'inc.', 'co','price','group','corporation', 'company', 'stock', 'common', 'shares', 'limited', 'ordinary','share','holdings','corp'}
  query_words = [word for word in query.split() if word not in exclude_words]
  print(query_words)
  best_match = None
  max_overlap = 0
  for brand_name in stock_data["Company Name"].tolist():
    brand_name_lower = brand_name.lower()
    brand_words = [word for word in brand_name_lower.split() if word not in exclude_words]
    overlap = len(set(query_words) & set(brand_words))
    # print(overlap)
    if overlap > max_overlap:
      best_match = stock_data[stock_data["Company Name"] == brand_name]["Symbol"].values[0]
      max_overlap = overlap
  
  return best_match

# user_query='What was the price of Zumiez yesterday?'
# print(get_company_ticker(user_query))
#La Jolla Pharmaceutical Company
