import React, { useState, useEffect } from 'react';
import YearlyFinancialReports from './YearlyFinancialReports';

const AdvancedFinancialAnalysis = ({ ticker, companyName, onBack }) => {
  const [reportYears, setReportYears] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showYearlyReports, setShowYearlyReports] = useState(false);

  useEffect(() => {
    loadAvailableReports();
  }, [ticker]);

  const loadAvailableReports = async () => {
    try {
      setIsLoading(true);
      
      // Query database for available years for this company
      const query = `
        SELECT DISTINCT year 
        FROM FinancialData 
        WHERE ticker = ? 
        ORDER BY year DESC
      `;
      
      const results = await window.database.SQLiteSelectData({
        query,
        inputData: [ticker]
      });

      // For each year, check what reports are available
      const yearsWithReports = results.map((row) => ({
        year: row.year,
        has10K: true, 
        has10Q: true  
      }));

      setReportYears(yearsWithReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReports = (year) => {
    setSelectedYear(year);
    setShowYearlyReports(true);
  };

  const handleBackFromYearly = () => {
    setShowYearlyReports(false);
    setSelectedYear(null);
  };

  const getLatestYears = () => {
    // Get last 6 years or all available years
    return reportYears.slice(0, 6);
  };

  // If we're showing yearly reports, render that component instead
  if (showYearlyReports && selectedYear) {
    return (
      <YearlyFinancialReports
        ticker={ticker}
        companyName={companyName}
        year={selectedYear}
        onBack={handleBackFromYearly}
      />
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="riskTitleContainer">
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '15px'
          }}
        >
          ← Back
        </button>
        <h2>
          <span className="material-icons">analytics</span>
          Advanced Financial Analysis
        </h2>
      </div>

      <div className="riskBody">
        {/* Company Header */}
        <div className="riskContainer" style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            margin: '0 0 10px 0',
            color: '#333'
          }}>
            {companyName}
          </h1>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'normal', 
            margin: '0',
            color: '#666',
            textTransform: 'uppercase'
          }}>
            {ticker}
          </h2>
        </div>

        {/* Reports by Year - Grid Layout */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="inputLabel">Loading available reports...</div>
          </div>
        ) : getLatestYears().length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="inputLabel">No financial reports available for {ticker}</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            padding: '0 20px'
          }}>
            {getLatestYears().map((reportYear) => (
              <div key={reportYear.year} style={{
                border: '1px solid #d0d0d0',
                borderRadius: '8px',
                padding: '30px 25px',
                backgroundColor: 'white'
              }}>
                <h3 style={{ 
                  fontSize: '32px',
                  fontWeight: 'bold',
                  margin: '0 0 12px 0',
                  color: '#000'
                }}>
                  {reportYear.year}
                </h3>
                
                <p style={{ 
                  margin: '0 0 20px 0',
                  color: '#666',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  10K and 10Q reports are available here
                </p>
                
                <button
                  onClick={() => handleViewReports(reportYear.year)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#e8e8e8';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#f0f0f0';
                  }}
                >
                  Go to Reports
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFinancialAnalysis;