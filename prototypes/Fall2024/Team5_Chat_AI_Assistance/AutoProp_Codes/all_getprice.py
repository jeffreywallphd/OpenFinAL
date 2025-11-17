import requests
import openai
import os
from dotenv import load_dotenv

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

# Function to handle user queries
# def handle_query(query):
#     if "current price" in query:
#         stock_symbol = "AAPL"  # Extract based on the query
#         price = get_current_price(stock_symbol)
#         return f"The current price of {stock_symbol} is ${price}."
    
#     elif "price" in query and "three months ago" in query:
#         stock_symbol = "AMD"  # Extract based on the query
#         historical_price = get_historical_price(stock_symbol, "2023-07-20")  # Example date
#         return f"The price of {stock_symbol} stock three months ago was ${historical_price}."
    
#     elif "how has" in query:
#         stock_symbol = "NVIDIA"  # Extract based on the query
#         # Fetch performance data (like percentage change)
#         performance_data = "X%"  # Placeholder for performance data
#         return f"NVIDIA has performed {performance_data} over the past year."
    
#     elif "trading volume" in query:
#         stock_symbol = "KO"  # Coca-Cola's ticker symbol
#         volume = get_trading_volume(stock_symbol)
#         return f"The trading volume of Coca-Cola is {volume}."
    
#     else:
#         return "I'm sorry, I couldn't understand the query."

# Example usage
# user_query = "AAPL"
# print(handle_query(user_query))
