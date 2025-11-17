from flask import Flask, request, jsonify
import joblib
import requests,json
import os
from dotenv import load_dotenv
import spacy
import dateparser
from flask_cors import CORS

headers = {
    "Authorization": "Bearer #"}
# the api key is from my account in eden AI
# headers = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTZmNWU3NTEtYTk1Yi00Yjk0LTg1NTEtOGVhYTRlNTA1MzA0IiwidHlwZSI6ImFwaV90b2tlbiJ9.nH31uN0l4nhs01BMq3wtfFn68ZtPAN9-fsn9Uwdv9XY"}
str_m1 = "[In today's market, companies like Apple, Microsoft, Google, and Amazon are leading the tech sector. Meanwhile, Tesla continues to show strong performance, and investors are closely watching stocks like Nvidia and Netflix for potential gains. Other notable mentions include IBM and Intel, which are also making headlines in the financial news. Additionally, energy stocks like ExxonMobil and Chevron are gaining traction as oil prices fluctuate. The healthcare sector, represented by companies like Johnson & Johnson and Pfizer, remains a key focus for investors amid ongoing developments.]"
url = "https://api.edenai.run/v2/text/generation"


def fetch_stock_name(prompt):
    # Example text input
    text = ("I will provide a sentence enclosed in square brackets '[ ]'."
            " The sentence will pertain to a stock in the stock market."
            " Your task is to identify the mentioned stock and return its ticker symbol."
            " Present the name of the stock along with its ticker symbol in the format 'stock_name: ticker_symbol'."
            " For example, if the stock mentioned is 'Apple', then the output should be 'Apple: AAPL'."
            " If multiple stocks are mentioned, separate them with commas."
            "The sentence is: "
            )

    input_text = text + prompt + " "

    payload = {
        "providers": "openai,cohere",
        "text": input_text,
        "temperature": 0.2,
        "max_tokens": 500,
        "fallback_providers": ""

    }
    response = requests.post(url, json=payload, headers=headers)
    print(response)
    result = json.loads(response.text)
    result = result['openai']['generated_text']
    stock_pairs = result.split(",")

    stocks = {}
    for pair in stock_pairs:
        if ":" in pair:
            name, ticker = pair.split(":")
            stocks[name.strip()] = ticker.strip()
    fetch_first_stock = list(stocks.keys())[0]
    return stocks[fetch_first_stock]

##########################################################################################

# content from ALL_GETPRICE.PY

# Load environment variables from the .env file
load_dotenv()

# Access the API key
financial_api_key = os.getenv('API_KEY')
# Set your API keys
# openai.api_key = 'your_openai_api_key'

# #Function to get current stock price
def get_current_price(symbol):
    response = requests.get(f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={financial_api_key}')
    data = response.json()
    return data['Global Quote']['05. price']

# Function to get historical stock price
def get_historical_price(symbol, date):
    # Implementation will depend on the API used
    # For example, using Alpha Vantage for historical data
    response = requests.get(f'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol={symbol}&apikey={financial_api_key}')
    data = response.json()
    # Extract the price from the date provided
    return data['Time Series (Daily)'].get(date, {}).get('4. close')

# Function to get trading volume
def get_trading_volume(symbol):
    response = requests.get(f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={financial_api_key}')
    data = response.json()
    return data['Global Quote']['06. volume']
###########################################################################################
# EXTRACT.PY CONTENT

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")


def extract_dates(query):
    # Parse the query using spaCy
    doc = nlp(query)

    # Attempt to find dates using spaCy's NER
    for ent in doc.ents:
        if ent.label_ == "DATE":
            return dateparser.parse(ent.text)  # Use dateparser for parsing

    # Fallback: if no date is found, try using dateparser on the whole query
    parsed_date = dateparser.parse(query)
    return parsed_date

###########################################################################################
# ACTUAL API WRAP
###########################################################################################

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # This will allow all cross-origin requests

# Load the pre-trained intent model
loaded_model = joblib.load('intent_model.pkl')

# Functions for intents
def general_question():
    return "That's a great question! Here's some information about the stock market..."


def get_price(user_input):
    ticker = fetch_stock_name(user_input)
    if not ticker:
        return "Stock ticker not found."
    curr_price = get_current_price(ticker)
    return f"Price of {ticker} is: {curr_price}"


def get_historical(user_input):
    ticker = fetch_stock_name(user_input)
    if not ticker:
        return "Stock ticker not found."
    date_from_query = extract_dates(user_input)

    if date_from_query is None:
        return f"We know you are trying to get historical price of {ticker}. Can you be more specific on dates?"
    else:
        date_from_query = date_from_query.strftime('%Y-%m-%d')
        hist_price = get_historical_price(ticker, date_from_query)
        if hist_price is None:
            return "Seems like the stock market was closed that day."
        return f"The price of {ticker} on {date_from_query} was {hist_price}"


def unknown_intent():
    return "We know that it is a great question but currently this is out of our scope. But, we will be back soon. AutoProphet rocks"


# Define the intent mappings
intent_map = {
    "General_Info": lambda user_input: {"response": general_question()},
    "Get_Historical": lambda user_input: {"response": get_historical(user_input)},
    "Get_Price": lambda user_input: {"response": get_price(user_input)}
}



# Flask route to process user input
@app.route('/chatbot', methods=['GET'])
def chatbot():
    user_input = request.args.get("query")
    if not user_input:
        return jsonify({"error": "No query provided."}), 400

    # Predict intent
    intent = loaded_model.predict([user_input])[0]

    # Find the response based on intent
    response_func = intent_map.get(intent, lambda user_input: {"response": unknown_intent()})
    response = response_func(user_input)

    return jsonify(response)


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
