## Generating and Using a Financial Modeling Prep (FMP) API Key

This guide walks you through the complete process of creating a Financial Modeling Prep (FMP) account, retrieving your API key, storing it in your environment configuration, and optionally switching your application to use the FMP gateway instead of AlphaVantage. Follow each step carefully to ensure your API integration works correctly.

---

### 1. Sign Up for a Financial Modeling Prep Account

Before you can use the FMP API, you must create an account on their website.

1. Navigate to the official registration page:
   - [**FMP Signup**](https://site.financialmodelingprep.com/register)
2. If you do not have an account, complete the registration form to create one.
3. If you already have an account, simply sign in using your existing credentials.

After signing in, you will be redirected to your FMP dashboard or home page.

---

### 2. Locate and Copy Your FMP API Key

Once you are logged into your account, follow these steps to find your API key:

1. Look toward the **top-right corner** of the screen.
2. Click the option labeled **Dashboard**.
3. On your dashboard page, your **API Key** will be displayed clearly.
4. Copy this API key — you will need it to authenticate API requests from your application.

Your API key is a long alphanumeric string unique to your account. Anyone with the key can consume your request quota, so keep it private.

---

### 3. Add Your API Key to Your `.env` Configuration File

Your application expects API keys to be stored inside a `.env` (environment variable) file. This allows your code to read the key securely without hard-coding it.

Add both of your keys (AlphaVantage and FMP) to your `.env` file in the following structure:

```json
{
  "ALPHAVANTAGE_API_KEY": "Your AlphaVantage API key",
  "FMP_API_KEY": "Your Financial Modeling Prep API key"
}

* Now, if you want to fetch data using Financial Modeling Prep instead of AlphaVantage, you will have to change the default.json as shown below:
{
  "StockGateway": "FMPStockGateway",
  "NewsGateway": "AlphaVantageNewsGateway",
  "ReportGateway": "AlphaVantageRatioGateway"
}
* If you want to continue with AlphaVantage, then avoid the last step. You can manually change that thing as many times as you like, but note that once the API reaches its daily limit, it will stop working for you.
