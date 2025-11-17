import requests,json
#the api key is from anonymous
headers = {"Authorization": "Bearer #"}
#the api key is from my account in eden AI
str_m1="[In today's market, companies like Apple, Microsoft, Google, and Amazon are leading the tech sector. Meanwhile, Tesla continues to show strong performance, and investors are closely watching stocks like Nvidia and Netflix for potential gains. Other notable mentions include IBM and Intel, which are also making headlines in the financial news. Additionally, energy stocks like ExxonMobil and Chevron are gaining traction as oil prices fluctuate. The healthcare sector, represented by companies like Johnson & Johnson and Pfizer, remains a key focus for investors amid ongoing developments.]"
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
    result =result['openai']['generated_text']
    stock_pairs = result.split(",")
    
    stocks = {}
    for pair in stock_pairs:
        if ":" in pair:
            name, ticker = pair.split(":")
            stocks[name.strip()] = ticker.strip()
    fetch_first_stock=list(stocks.keys())[0]
    # fetch_first_stock=list(stocks.keys())
    return stocks[fetch_first_stock]
# str_m1="price of Berkshire Hathaway Inc."
# final_out=(fetch_stock_name(str_m1))
# print(final_out)

                                                                                
