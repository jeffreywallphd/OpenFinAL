import React, { useState, useRef } from 'react';
import { FinancialAnalysisInteractor } from '../Interactor/FinancialAnalysisInteractor';

function SnP500() {
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

  const handleSearch = async () => {
    const searchTicker = tickerRef.current.value;
    
    if (!searchTicker) {
      alert('Please enter a ticker symbol');
      return;
    }

    setIsLoading(true);
    
    try {
      const interactor = new FinancialAnalysisInteractor();
      const result = await interactor.analyzeCompany(searchTicker);
      
      if (result.success && result.companyInfo) {
        setBusinessName(result.companyInfo.businessName);
        setTickerSymbol(result.companyInfo.tickerSymbol);
        setSector(result.companyInfo.sector);
        setIndustry(result.companyInfo.industry);
        setRatios(result.ratios);
      } else {
        alert(`No data found for ticker: ${searchTicker}`);
        handleClear();
      }
      
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching for company data');
      handleClear();
    } finally {
      setIsLoading(false);
    }
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
          S&P 500 Financial Analysis
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
              placeholder="Please enter a ticker symbol (e.g., MSFT, AAPL, NVDA)"
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

export { SnP500 };
export default SnP500;
