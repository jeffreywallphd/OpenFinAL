## Using this guide, you can generate a Financial Modeling Prep (FMP) API key:

* First, you will need to sign up with FMP. Click on the link below to visit the FMP sign-up page:
* [FMP Signup](https://site.financialmodelingprep.com/register)

* Now, create a free account or if you already have an account, then simply sign in using that account.

* After successfully completing the authentication process, you will be redirected to the home page.

* Then, select the Dashboard option from the top right corner of the screen, and you will be able to see your API key.

* Copy that API key and add it to your .env file as shown below:
    * {
        "ALPHAVANTAGE_API_KEY": "Your AlphaVantage API key",
        "FMP_API_KEY" : "Your Financial Modeling Prep API key"
    }

* Now, if you want to fetch data using Financial Modeling Prep instead of AlphaVantage, you will have to change the default.json as shown below:
    * { "StockGateway": "FMPStockGateway", "NewsGateway": "AlphaVantageNewsGateway", "ReportGateway": "AlphaVantageRatioGateway"}

* If you want to continue with AlphaVantage, then avoid the last step. You can manually change that thing as many times as you like, but keep in mind that once the API reaches its daily limit, it will stop working for you.
