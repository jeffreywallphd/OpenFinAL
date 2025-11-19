import React, { useState, useRef } from 'react';
import AdvancedFinancialAnalysis from './AdvancedFinancialAnalysis';

function SnP500() {
  const tickerRef = useRef(null);
  const [businessName, setBusinessName] = useState('');
  const [tickerSymbol, setTickerSymbol] = useState('');
  const [sector, setSector] = useState('');
  const [industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);
  
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
    { name: '', key: '' }
  ];

  const handleClear = () => {
    if (tickerRef.current) {
      tickerRef.current.value = '';
    }
    setBusinessName('');
    setTickerSymbol('');
    setSector('');
    setIndustry('');
    setHasResults(false);
    setShowAdvancedAnalysis(false);
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

  const handleAdvancedAnalysis = () => {
    setShowAdvancedAnalysis(true);
  };

  const handleBackFromAdvanced = () => {
    setShowAdvancedAnalysis(false);
  };

  const testDatabaseConnection = async () => {
    try {
      const testQuery = "SELECT COUNT(*) as count FROM FinancialData";
      const result = await window.database.SQLiteSelectData({ 
        query: testQuery, 
        inputData: [] 
      });
      
      alert(`✅ Database connected! Found ${result[0].count} records`);
      
    } catch (error) {
      alert(`❌ Database test failed: ${error.message}`);
    }
  };

  const handleSearch = async () => {
    const searchTicker = tickerRef.current.value;
    
    if (!searchTicker) {
      alert('Please enter a ticker symbol');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔍 Searching for:', searchTicker.toUpperCase());
      
      const query = `
        SELECT ticker, company_name, year, revenues, gross_profit, net_income_loss, earnings_per_share_basic 
        FROM FinancialData 
        WHERE ticker = ? 
        ORDER BY year DESC 
        LIMIT 1
      `;
      
      const results = await window.database.SQLiteSelectData({ 
        query, 
        inputData: [searchTicker.toUpperCase()] 
      });
      
      if (results && results.length > 0) {
        const data = results[0];
        console.log('✅ Found company:', data.company_name);
        
        setBusinessName(data.company_name);
        setTickerSymbol(data.ticker);
        setSector('Technology');
        setIndustry('Software');
        setHasResults(true);
        
        const revenues = data.revenues || 0;
        const grossProfit = data.gross_profit || 0;
        const netIncome = data.net_income_loss || 0;
        const eps = data.earnings_per_share_basic || 0;
        
        const calculatePercentage = (part, whole) => {
          if (!whole || whole === 0) return '-';
          return `${((part / whole) * 100).toFixed(2)}%`;
        };
        
        setRatios({
          currentRatio: '',
          returnOnAssets: '',
          grossProfitMargin: calculatePercentage(grossProfit, revenues),
          netProfitMargin: calculatePercentage(netIncome, revenues),
          operatingProfitMargin: '',
          assetTurnover: '',
          earningsPerShare: eps ? `$${eps.toFixed(2)}` : '-',
          priceToEarnings: '',
          debtToEquity: '',
          returnOnEquity: '',
          quickRatio: '',
          returnOnAssetsROA: ''
        });
        
      } else {
        setHasResults(false);
        alert(`No financial data found for ticker: ${searchTicker.toUpperCase()}\n\nTry: MSFT, AAPL, NVDA, AMZN, GOOG`);
      }
      
    } catch (error) {
      console.error('❌ Search error:', error);
      setHasResults(false);
      alert(`Database error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // If we're showing advanced analysis, render that component instead
  if (showAdvancedAnalysis) {
    return (
      <AdvancedFinancialAnalysis
        ticker={tickerSymbol}
        companyName={businessName}
        onBack={handleBackFromAdvanced}
      />
    );
  }

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
              placeholder="Enter ticker symbol (e.g., MSFT, AAPL, NVDA, AMZN)"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="priceSearchButton" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? '...' : '🔍'}
            </button>
          </div>

          <div className="inputGroup">
            <button className="bigbutton" onClick={handleClear}>Clear</button>
            <button className="bigbutton" onClick={testDatabaseConnection} style={{marginLeft: '10px'}}>
              Test Connection
            </button>
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

        {/* Investment Ratios Section with Advanced Analysis Button */}
        <div className="riskContainer" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 className="riskHeader">Investment Ratios:</h3>
            
            {/* Advanced Analysis Button - Only shows when hasResults is true */}
            {hasResults && (
              <button 
                className="advanced-analysis-btn"
                onClick={handleAdvancedAnalysis}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  height: '40px'
                }}
              >
                <span className="material-icons" style={{ marginRight: '8px', fontSize: '18px' }}>
                  analytics
                </span>
                Advanced Financial Analysis
              </button>
            )}
          </div>
          
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
