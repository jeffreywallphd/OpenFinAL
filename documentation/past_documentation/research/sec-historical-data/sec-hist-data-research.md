## SEC Historical Data Research ##

### Research Topic #1: SEC_Accounting Ratios, Bloomberg Terminal, Other Information

#### Accounting Ratios
##### Working Capital Ratios
- Current Assets / Current Liabilities
- Shows how much of your business revenue must be used to meet payment obligations as they fall due
- Shows you how much you have left to use for new opportunities
- Generally, a 1.5-2:1 is a good WC ratio, it usually indicates a company is on solid financial ground in terms of liquidity
##### EPS
- Earnings Per Share
- [Net Income - Preferred Dividends] / Weighted Average Number of Shares Outstanding
- How much money a company makes for each share of its stock
- Widely used for estimating corporate value
- No fixed “good” EPS
- Depending on where the business is at and where they want to go
##### Price-Earning Ratio
- Share Price / Earnings Per Share
- A way to measure how expensive a company’s shares are
- A high P/E ratio can mean a stock’s price is high relative to earnings and possibly overvalued
- A low P/E ratio can mean that the current stock price is low relative to earnings
##### Debt-to-Equity-Ratio
- [Short-Term Debt + Long-Term Debt + Other Fixed Payments] / Shareholder’s Equity
- Indicates how much debt a company is using to finance its assets relative to the value of shareholders’ equity
- Around 1-1.5:1 is a good ratio, however, the ideal debt-to-equity ratio will vary depending on the industry
##### Return-on-Equity Ratio
- Net Income / Average Total Equity
- Measurement of a corporation's performance in a given period
- Their efficiency in generating income
- Normally a good ratio is around 1.15-1.2:1
##### Quick Ratio
- [Current Assets - Inventory] / Current Liabilities 
- Measures a company’s ability to quickly convert liquid assets into cash to pay for its short-term financial obligations. 
- Generally, higher is better
##### Gross Profit Margin
- [Revenue - COGS] / Revenue
- The money the company makes after accounting for the cost of doing business
- 50-70% is generally considered healthy
- Very dependent on the given industry

#### Bloomberg Terminal
##### Important Features
- Allows user access to Bloomberg data service
- Provides real-time global financial data, news feeds, and messages
- Investors can use the Bloomberg terminal trading system
- Facilitates the placement of financial transaction
- Stocks and options trades

#### API Information
##### API location
- All API’s that we would use can be found at the SEC website with clear directions on how to access them
- https://www.sec.gov/edgar/sec-api-documentationdata.sec.gov/api/xbrl/frames/ can be used to distinguish the CIK from the company searched. 

#### Other Important Information
#### Reports
- Idea: just link to the reports.
##### Quarterly (10Q)
- Information included:
  
- Condensed financial statements
##### SemiAnnual
- 1-SA
- Filed 90 days after the semi-annual period ends (a lot can change in 90)
- The report must be signed by the issuer, its principal executive officer, principal financial officer and principal accounting officer.
- Information is reported correctly under GAAP
- Information included:
  
- Balance sheets
- Consolidated income statements
- Statement of cash flows
- An analysis/reconciliation of the stockholders equity portion of the balance sheet
- All financial statements of other companies or entities owned
###### Annual
- 10K
- Need date reported
- An annual report to security holders is required
- Information included:

- Subsidiaries
- Financial statements
- Eps
##### API Useful info:
- Submission
- Name
- Stock exchange
- Ticker symbol
- Company Concept
- One thing per call
- Company Facts
- Everything available in company concept, in one call
- Frames
- Send year or quarter

### Research Topic #2: User Stories

#### User Epic Story 1: As an investor, I want to see historical data on all publicly traded companies.
##### User Story 1.1: As an investor, I want to see the main data points for the companies I am invested in
- Acceptance Criteria / Tasks:
- Data should be pulled from SEC EDGAR in order to get the most accurate information 
- Data should be the most relevant and important information for the investor
- Data should be organized in a visually appealing way
- Data should be located on the company page under the company name and stock chart

##### User Story 1.2: As an investor, I want to be able to look at the historical data of a company to help me make financial decisions on my investments within that company.
- Acceptance Criteria / Tasks:
- 10K or 10Qs should be pulled from an API specified for the company.
- The information should be broken down into balance statements, income statements, retained earnings, etc.
- Information should be relevant for the documentation the user searched for as well as the time they searched for.

#### User Epic Story 2: As an investor, I want to be able to see news on publicly traded companies and regulatory/compliance.
##### User Story 2.1: As an investor, I want to be able to see up-to-date news on publicly traded companies
- Acceptance Criteria / Tasks:
- Data needs to be updated frequently when News is published
- Information should be organized in the News Section 
- Newest information first
- Organized and structured
- Shows the date and title for the news article OR It should be under the financial information on the company’s stock page
###### User Story 2.2: As an investor, I want the news I see on the application to be accurate.
- Acceptance Criteria / Tasks:
- Data should be pulled from SEC EDGAR in order to get the most accurate information 
- No using outside sources where accuracy could be a problem
- News articles should be regularly checked for accuracy

### Research Topic #3: Interview Questions
#### Beginning Investors
- Can you share your current understanding of finance and investing? What specific challenges or concerns do you face when analyzing stocks and making investments?
- Can you describe your preferred learning style when it comes to understanding complex financial concepts? How do you typically seek information and educate yourself on new topics?
- How comfortable are you with using technology, and what features do you believe are essential for an online investing platform to be user-friendly for someone with limited experience?
- How would you describe your risk tolerance and investment goals?
- What financial decisions do you find most challenging?
- Describe to me a situation where you needed financial information to make a decision but you found it difficult to understand.
#### Individual Traders
- What is your experience level in online trading, and what platforms have you used before? Can you identify any specific features in existing platforms that you find particularly useful or lacking?
- How do you manage and organize your investment portfolio currently? Are there specific tools or features you wish were available to make this process more efficient?
- Can you recall a specific instance where a trading platform feature significantly impacted your decision-making process positively or negatively?
- How do you stay informed about market trends and news relevant to your investments?
#### Potential Traders
- What factors are currently preventing you from entering the world of online investing?
- What sources do you currently rely on for financial information, and how confident do you feel in interpreting and utilizing this information?
- What are your expectations regarding the educational content of an online investing platform?
- What role does financial literacy play in your decision-making process when considering online investing?
#### Educational Institutions
- How are financial concepts currently taught in your institution? What resources do you find lacking in your teaching methods?
- In what format do you usually deliver financial education content to your students? Are there any specific challenges you face in engaging your students in financial topics?
- What are key learning outcomes you aim to achieve when teaching financial concepts?
- What is a feature/mechanic from previously used financial software that you didn’t like (enhanced your user experience).
- What is a feature/mechanic from previously used financial software that you liked (enhanced your user experience).
- When investing what company information do you use to make decisions on trading
- What kind of company news would you like to know to make decisions on trading?
- If news is displayed to you about a company, how many articles/stories/facts would you prefer to see? 
- What features would the ideal financial dashboard need to have for you to consider using it?
- What features would a dashboard have that would deter you from using it? 
- How would you use an AI chatbot in a financial software application?
- What are your concerns with an AI chatbot in a financial software application?
- What kind of notifications would you hope to receive about your trading stocks?
- What kind of notifications tend to be useless to you when trading?
- What is a major factor in your decision to remove a stock from your portfolio?
- What is a major factor in your decision to add a stock to your portfolio? 
- When searching for stocks, what filters do you use?
- What kind of financial history do you use to analyze stocks?

#### Who to Interview?
##### Investors
- Various demographics
- Website Designers
- Data Analyst
- Bankers/Consultants/Wealth Management
- See what data is relevant to analyzing an organization
- Students
- 3rd yr or later, has basic finance experience at least
##### Questions/Who to Ask (SEC Historical Data Team)
- What metrics or indicators are crucial when assessing the historical data of an organization?
- What challenges have you experienced when using investing applications?
- What aspects of investing applications have you enjoyed using?
- How can an application like this be relevant to people other than common investors (Bankers, Consultants)?
- Would you want information from 10k, 10Q, etc?
- Board of Directors
- Main Aspects
- Revenues
- Assets 
- Liabilities
- Operating Risks
- Have you used Bloomberg Terminal?
- YES:
- What did you like and use most while using the terminal?
- What did you dislike about the terminal?
- NO:
- Why have you not used it?
- What did you use instead?
