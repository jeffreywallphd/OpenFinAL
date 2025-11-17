import re
import yfinance as yf
from transformers import pipeline
import speech_recognition as sr
import pandas as pd
import pyttsx3 
#from fuzzywuzzy import process

# Fetch S&P 500 companies from Wikipedia
url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
tables = pd.read_html(url)
sp500_table = tables[0]

# Function to fetch stock data
def fetch_stock_data(ticker):
    stock = yf.Ticker(ticker)
    
    return stock.info

# Load FinBERT for sentiment analysis
finbert = pipeline("sentiment-analysis", model="ProsusAI/finbert")

# Known ticker symbols
known_tickers = sp500_table['Symbol'].tolist()

def speak(text):
    engine = pyttsx3.init()  # Initialize the TTS engine
    engine.setProperty('rate', 150)  # Set speed of speech
    engine.setProperty('volume', 1)  # Set volume level (0.0 to 1.0)
    engine.say(text)  # Convert text to speech
    engine.runAndWait()   
    



def extract_ticker(question):
    # Convert the question to uppercase for case-insensitive matching
    question_upper = question.upper()
    # Find all possible tickers in the question
    for ticker in known_tickers:
        if ticker in question_upper.split():  # Check against individual words
            print(ticker)
            return ticker
    return None

    
    #return None
def get_officer_by_role(officers, role):
    for officer in officers:
        if role.lower() in officer['title'].lower():
            return officer
    return None

# Function to get audio input
def get_audio_input(recognizer):
    with sr.Microphone() as source:
        print("Please speak a sentence with a company name...")
        recognizer.adjust_for_ambient_noise(source)
        audio_data = recognizer.listen(source)
        print("Recognizing...")
        try:
            return recognizer.recognize_google(audio_data)
        except sr.UnknownValueError:
            print("Sorry, I could not understand the audio.")
            return None
        except sr.RequestError as e:
            print(f"Could not request results from Google Speech Recognition service; {e}")
            return None

# Function to ask questions based on context
def ask_question(context, question, ticker):
    # Sentiment analysis
    if "sentiment" in question.lower():
        sentiment_result = finbert(context.get('longBusinessSummary', ''))
        return f"Sentiment: {sentiment_result[0]['label']} (Score: {sentiment_result[0]['score']:.2f})"
    
    if "ceo" in question.lower() or "chief executive officer" in question.lower():
        officers = context.get('companyOfficers', [])
        ceo = get_officer_by_role(officers, "CEO")
        if ceo:
            return f"The CEO of {ticker} is {ceo['name']} - {ceo['title']}"
        else:
            return "Sorry, I couldn't find the CEO information."
    if "cfo" in question.lower() or "chief financial officer" in question.lower():
        officers = context.get('companyOfficers', [])
        cfo = get_officer_by_role(officers, "Chief Financial Officer" or "CFO")
        if cfo:
            return f"The CFO of {ticker} is {cfo['name']} - {cfo['title']}"
        else:
            return "Sorry, I couldn't find the CFO information."
    # Key metrics inquiries
    inquiries = {
        "current price": f"The current price of {ticker} is {context.get('currentPrice', 'N/A')}.",
        "current stock price": f"The current stock price of {ticker} is {context.get('currentPrice', 'N/A')}.",
        "todays price": f"The current price of {ticker} is {context.get('currentPrice', 'N/A')}.",
        "price now": f"The current price of {ticker} is {context.get('currentPrice', 'N/A')}.",
        "market cap": f"The market cap of {ticker} is {context.get('marketCap', 'N/A')}.",
        "market capitalization": f"The market cap of {ticker} is {context.get('marketCap', 'N/A')}.",
        "52-week high": f"The 52-week high of {ticker} is {context.get('fiftyTwoWeekHigh', 'N/A')}.",
        "year high": f"The 52-week high of {ticker} is {context.get('fiftyTwoWeekHigh', 'N/A')}.",
        "52-week low": f"The 52-week low of {ticker} is {context.get('fiftyTwoWeekLow', 'N/A')}.",
        "year low": f"The 52-week low of {ticker} is {context.get('fiftyTwoWeekLow', 'N/A')}.",
        "previous close": f"The previous close was {context.get('regularMarketPreviousClose', 'N/A')}.",
        "open": f"The stock opened at {context.get('regularMarketOpen', 'N/A')}.",
        "day low": f"The day low is {context.get('dayLow', 'N/A')}.",
        "todays low": f"The day low is {context.get('dayLow', 'N/A')}.",
        "day high": f"The day high is {context.get('dayHigh', 'N/A')}.",
        "todays high": f"The todays high is {context.get('dayHigh', 'N/A')}.",
        "dividend rate": f"The dividend rate is {context.get('dividendRate', 'N/A')}.",
        "dividend yield": f"The dividend yield is {context.get('dividendYield', 'N/A')}.",
        "payout ratio": f"The payout ratio is {context.get('payoutRatio', 'N/A')}.",
        "trailing pe": f"The trailing P/E ratio is {context.get('trailingPE', 'N/A')}.",
        "forward pe": f"The forward P/E ratio is {context.get('forwardPE', 'N/A')}.",
        "beta": f"The beta is {context.get('beta', 'N/A')}.",
        "total revenue": f"Total revenue is {context.get('totalRevenue', 'N/A')}.",
        "net income": f"Net income is {context.get('netIncomeToCommon', 'N/A')}.",
        "earnings growth": f"Earnings growth is {context.get('earningsGrowth', 'N/A')}.",
        "revenue growth": f"Revenue growth is {context.get('revenueGrowth', 'N/A')}.",
        "profit margin": f"Profit margin is {context.get('profitMargins', 'N/A')}.",
        "industry": f"The industry is {context.get('industry', 'N/A')}.",
        "sector": f"The sector is {context.get('sector', 'N/A')}.",
        "company officers": context.get('companyOfficers', []),
        "major figures": context.get('companyOfficers', []),
        "prominent people": context.get('companyOfficers', []),
        "business summary": context.get('longBusinessSummary', 'N/A')
    }
    
    for inquiry, response in inquiries.items():
        if inquiry in question.lower():
            if isinstance(response, list):
                if response:
                    officer_list = "\n".join([f"{officer['name']} - {officer['title']}" for officer in response])
                    return f"Company Officers:\n{officer_list}"
                return "No company officers information available."
            return response
    
    return "I'm sorry, I can only provide sentiment analysis and some key metrics."

# Main function
def main():
    recognizer = sr.Recognizer()
    #speak("query with ticker ID please")
    speak("Hi, Welcome to Auto-Prophet. I am your voice Assistant Zesta. After this message,please make sure to say your ticker ID of the company clearly in your question.  For example: you can ask a question like , what is the  cuurrent stock price of T-S-L-A? ")
    #speak("T-s-L-A")
    print("Hi, Welcome to Auto-Prophet. I am your voice Assistant Zesta. After this message,please make sure to say your ticker ID of the company clearly in your question ")

    while True:

        spoken_text = get_audio_input(recognizer)

        if spoken_text:
            print(f"You said: {spoken_text}")
            ticker = extract_ticker(spoken_text)

            if ticker:
                stock_info = fetch_stock_data(ticker)
                context = stock_info  # Use the entire stock info as context

                answer = ask_question(context, spoken_text, ticker)
                print("Answer:", answer)
                speak(answer)
            else:
                print("Sorry, I couldn't find a valid stock ticker in your question.")
                speak("Sorry, I couldn't find a valid stock ticker in your question.")
        else:
            print("No spoken input detected.")
            speak("No spoken input detected.")
            break
 
if __name__ == "__main__":
    main()
