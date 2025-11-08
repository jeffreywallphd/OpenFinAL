import React, { useState, useRef } from 'react';

function FinancialAnalysis() {
  const tickerRef = useRef(null);
  
  const [businessName, setBusinessName] = useState('');
  const [tickerSymbol, setTickerSymbol] = useState('');
  const [sector, setSector] = useState('');
  const [industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [ratios, setRatios] = useState({
    currentRatio: '-',
    returnOnAssets: '-',
    grossProfitMargin: '-',
    netProfitMargin: '-',
    operatingProfitMargin: '-',
    assetTurnover: '-',
    earningsPerShare: '-',
    priceToEarnings: '-',
    debtToEquity: '-',
    returnOnEquity: '-',
    quickRatio: '-',
    returnOnAssetsROA: '-'
  });

  const investmentRatios = [
    { name: 'Current Ratio', key: 'currentRatio' },
    { name: 'Return on Assets', key: 'returnOnAssets' },
    { name: 'Gross Profit Margin', key: 'grossProfitMargin' },
    { name: 'Net Profit Margin', key: 'netProfitMargin' },
    { name: 'Operating Profit Margin', key: 'operatingProfitMargin' },
    { name: 'Asset Turnover', key: 'assetTurnover' },
    { name: 'Earnings Per Share (EPS)', key: 'earningsPerShare' },
    { name: 'Price-To-Earnings Ratio (P/E)', key: 'priceToEarnings' },
    { name: 'Debt-To-Equity Ratio', key: 'debtToEquity' },
    { name: 'Return on Equity (ROE)', key: 'returnOnEquity' },
    { name: 'Quick Ratio', key: 'quickRatio' },
    { name: 'Return on Assets (ROA)', key: 'returnOnAssetsROA' }
  ];

  const handleSearch = () => {
    const searchTicker = tickerRef.current.value;
    
    if (!searchTicker) {
      alert('Please enter a ticker symbol');
      return;
    }

    setIsLoading(true);
    
    // TODO: Replace with actual API call
    setTimeout(() => {
      setBusinessName('Apple Inc.');
      setTickerSymbol(searchTicker.toUpperCase());
      setSector('Technology');
      setIndustry('Consumer Electronics');
      
      setRatios({
        currentRatio: '1.07',
        returnOnAssets: '22.61%',
        grossProfitMargin: '43.31%',
        netProfitMargin: '25.31%',
        operatingProfitMargin: '29.82%',
        assetTurnover: '0.89',
        earningsPerShare: '$6.11',
        priceToEarnings: '28.5',
        debtToEquity: '1.96',
        returnOnEquity: '147.25%',
        quickRatio: '0.83',
        returnOnAssetsROA: '22.61%'
      });
      
      setIsLoading(false);
    }, 1000);
  };

  const handleClear = () => {
    tickerRef.current.value = '';
    setBusinessName('');
    setTickerSymbol('');
    setSector('');
    setIndustry('');
    setRatios({
      currentRatio: '-',
      returnOnAssets: '-',
      grossProfitMargin: '-',
      netProfitMargin: '-',
      operatingProfitMargin: '-',
      assetTurnover: '-',
      earningsPerShare: '-',
      priceToEarnings: '-',
      debtToEquity: '-',
      returnOnEquity: '-',
      quickRatio: '-',
      returnOnAssetsROA: '-'
    });
  };

  return (
    <div className="page">
      <div className="riskTitleContainer">
        <h2>
          <span className="material-icons">assessment</span> 
          10K / 10Q Financial Analysis
        </h2>
      </div>

      <div className="riskBody">
        {/* Search Section */}
        <div className="riskContainer">
          <h3 className="riskHeader"><b>Company Search</b></h3>
          
          <div className="priceSearchFormContainer">
            <input 
              type="text" 
              ref={tickerRef}
              className="priceSearchBar" 
              placeholder="Please enter a ticker symbol"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="priceSearchButton" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? '...' : '🔍'}
            </button>
          </div>

          <div className="inputGroup">
            <button className="bigbutton" onClick={handleClear}>Clear</button>
          </div>

          {/* Company Info Display */}
          <div className="gridContainer">
            <div className="divSpacing">
              <label className="inputLabel">Business Name</label>
              <input type="text" value={businessName} readOnly className="userInput" />
            </div>

            <div className="divSpacing">
              <label className="inputLabel">Ticker Symbol</label>
              <input type="text" value={tickerSymbol} readOnly className="userInput" />
            </div>

            <div className="divSpacing">
              <label className="inputLabel">Sector</label>
              <input type="text" value={sector} readOnly className="userInput" />
            </div>

            <div className="divSpacing">
              <label className="inputLabel">Industry</label>
              <input type="text" value={industry} readOnly className="userInput" />
            </div>
          </div>
        </div>

        {/* Investment Ratios Section */}
        <div className="riskContainer">
          <h3 className="riskHeader">Investment Ratios:</h3>
          
          {investmentRatios.map((ratio, index) => (
            <div key={index} className="bigScoreContainer">
              <div className="inputLabel">{ratio.name}</div>
              <div className="scoreComponentContainer">
                <div className="scoreComponent">{ratios[ratio.key]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { FinancialAnalysis };
export default FinancialAnalysis;