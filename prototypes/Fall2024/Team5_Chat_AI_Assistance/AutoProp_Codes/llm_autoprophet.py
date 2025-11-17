import pandas as pd
import nltk
# nltk.download('wordnet')
import joblib
import fetch_ticker_without_eden as stocktick
import all_getprice 
import extract
from sklearn.preprocessing import LabelEncoder


def general_question():
    return "That's a great question! Here's some information about the stock market..."

def get_price():
    ticker=stocktick.get_company_ticker(user_input)
    print(ticker)
    curr_price=all_getprice.get_current_price(ticker)
    print(curr_price)
    return "Price of "+ticker+" is : "+curr_price

def get_historical():
    ticker=stocktick.get_company_ticker(user_input)
    print(ticker)
    date_from_query= extract.extract_dates(user_input)
    print(date_from_query)
    if date_from_query is None:
        return "We know you are trying to get historical price of "+ticker+" . Can you be more specific on dates?"
    else:
        date_from_query=date_from_query.strftime('%Y-%m-%d')
        hist_price = all_getprice.get_historical_price(ticker, date_from_query)
        if hist_price is None:
            return "Seems like stock market was closed that day"
        return "The price of "+ticker+ " on "+date_from_query+" was "+hist_price
    # return "That's a great question! Here's some information about historical price of"

def unknown_intent():
    return "We know that it is a great question but currently this is out of our scope. But, we will be back soon. AutoProphet rocks"


intent_map = {
    # "current_price": get_stock_price,
    "General_Info": general_question,
    "Get_Historical":get_historical,
    "Get_Price":get_price
    # Add more intents here
}

loaded_model = joblib.load('intent_model.pkl')

# data = pd.read_excel(r"AutoProphet_KB.xlsx")  # Make sure to load your original data
# label_encoder = LabelEncoder()
# data['Intent'] = label_encoder.fit_transform(data['Intent'])
#testing out
user_input=input("User : ")

intent = loaded_model.predict([user_input])[0]
# intent=label_encoder.inverse_transform([intent_integer])[0]
class_prob = loaded_model.predict_proba([user_input])[0]
print(intent)
print(class_prob)
response_func = intent_map.get(intent, unknown_intent)
print(response_func())
