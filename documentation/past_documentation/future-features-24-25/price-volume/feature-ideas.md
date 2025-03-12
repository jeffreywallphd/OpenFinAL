## Price / Volume Future Feature Ideas ##

**Future Idea #1:** Current Price and Volume
- With our current educational key with Alpha Vantage, we cannot get current day price and volume data, only day-old data.
- You could try getting funding to pay for an Alpha Vantage Premium key (monthly subscription) or find a different API to get current price and volume data.
- Once you have the current price and volume data, you could implement a few ideas:
    - Display the current price and volume above all charts in red or green depending on if it has increased or decreased on the day.
    - Display the day change in price and volume
    - Update the 1D chart to be for the current day, and have it continually update (on a 10 or 15 sec interval)


**Future Idea #2:** More Analytical Data based on price and volume
- Look at Yahoo Finance (https://finance.yahoo.com/quote/IBM?.tsrc=fin-srch) under the price chart for ideas. I wouldn't add all of those data points as that might be much for the more beginner investor. However, some good ones that came up as useful in interviews might be:
    - Prev Close
    - Open
    - Day Low
    - Day High
    - 52-Week Low
    - 52-Week High
    - Dividend
    - Dividend Yield
    - Price/Earnings Ratio
    - Earnings Per Share
- Some of this data might be in collaboration with the SEC group.
- Some of the data may also need to be collected from another API.
 

**Future Idea #3:** Dividend History Chart
- This idea might take some work, but dividend investing is becoming more popular as more people are focusing on investing for retirement or more financial independence.
- Most brokers/investment research pages do not have a great way to see if a company increases their dividends or for how long they have had one.
    - A dividend history chart could set our system apart.
- The idea is that it would be a chart much like the price chart, but it would show the dividend paid over the lifetime of the stock if the stock has a dividend.
    - Finding this data might be a challenge, but it could be worth it.
- It might also be good to interview more people, maybe even some who you know are interested in dividends to see how useful this feature would be and if it is necessary.

**Future Idea #4:** News Snapshot
- Much like Google Finance and Yahoo Finance, we could include a news snapshot on the chart page under all the data.
- Because we already have a news page, the news snapshot could include just a few stories with a link to the news page for more.

**Future Idea #5:** Key Events Overlay
- The idea would be to mimic Google Finance's "Key Events" button.
    - When a button is pressed, key events that impact the price of a stock would overlay on the price charts.
    - The key events have a corresponding news article for further explanation.
- Google Finance only overlays key events specific to the current stock.
    - We could also add larger-scale events that impact a large quantity of stocks like initial COVID lockdowns or a boat taking out a bridge.
- This feature could take a decent amount of work to implement, but it could be very useful for beginning investors to learn about events that impact stock prices.