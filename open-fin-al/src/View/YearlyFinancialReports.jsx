import React, { useState, useEffect } from 'react';

const YearlyFinancialReports = ({ ticker, companyName, year, onBack }) => {
  const [financialData, setFinancialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [selectedYears, setSelectedYears] = useState([2020, 2021, 2022, 2023, 2024]);
  const [yearsRange, setYearsRange] = useState(5);

  useEffect(() => {
    loadFinancialData();
    loadQuarterlyData();
  }, [ticker, year, yearsRange]);

  const loadFinancialData = async () => {
    try {
      setIsLoading(true);
      
      const query = `
        SELECT 
          ticker, company_name, year, revenues, gross_profit, net_income_loss,
          earnings_per_share_basic, earnings_per_share_diluted, operating_income_loss,
          cost_of_revenue, operating_expenses
        FROM FinancialData 
        WHERE ticker = ? AND year = ?
      `;
      
      const results = await window.database.SQLiteSelectData({
        query,
        inputData: [ticker, year]
      });

      if (results && results.length > 0) {
        setFinancialData(results[0]);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuarterlyData = async () => {
    try {
      const currentYear = parseInt(year);
      const startYear = currentYear - yearsRange + 1;
      
      const query = `
        SELECT year, gross_profit, revenues, net_income_loss, operating_income_loss
        FROM FinancialData 
        WHERE ticker = ? AND year BETWEEN ? AND ?
        ORDER BY year
      `;
      
      const results = await window.database.SQLiteSelectData({
        query,
        inputData: [ticker, startYear, currentYear]
      });

      if (results && results.length > 0) {
        setQuarterlyData(results);
        const availableYears = results.map(data => data.year);
        setSelectedYears(availableYears);
      }
    } catch (error) {
      console.error('Error loading quarterly data:', error);
    }
  };

  const calculateGrossProfitMargin = (grossProfit, revenue) => {
    if (!grossProfit || !revenue || revenue === 0) return 0;
    return (grossProfit / revenue) * 100;
  };

  const getCurrentGrossProfitMargin = () => {
    if (!financialData) return '0%';
    const margin = calculateGrossProfitMargin(financialData.gross_profit, financialData.revenues);
    return `${margin.toFixed(1)}%`;
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${(value / 1000).toFixed(1)}K`;
  };

  const generateHistogramData = () => {
    return selectedYears.map(year => {
      const yearData = quarterlyData.find(data => data.year === year);
      const margin = yearData ? calculateGrossProfitMargin(yearData.gross_profit, yearData.revenues) : 0;
      
      const maxMargin = Math.max(...quarterlyData.map(d => calculateGrossProfitMargin(d.gross_profit, d.revenues)), 50);
      const heightPercentage = margin > 0 ? (margin / maxMargin) * 100 : 20;
      
      return {
        year,
        label: `Q1,${year}`,
        margin,
        height: `${Math.max(20, heightPercentage)}%`,
        grossProfit: yearData ? formatCurrency(yearData.gross_profit) : '$0',
        revenue: yearData ? formatCurrency(yearData.revenues) : '$0'
      };
    });
  };

  const handleYearsRangeChange = (event) => {
    const newRange = parseInt(event.target.value);
    setYearsRange(newRange);
  };

  const handleKeywordRemove = (keyword) => {
    console.log(`Removing keyword: ${keyword}`);
  };

  const histogramData = generateHistogramData();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Loading financial reports...</h2>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fff', overflow: 'hidden' }}>
      {/* Left Sidebar - Made more compact */}
      <div style={{ 
        width: '220px', 
        padding: '15px',
        borderRight: '1px solid #e0e0e0',
        backgroundColor: '#fff',
        overflowY: 'auto'
      }}>
        {/* Logo/Icon */}
        <div style={{ 
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#333'
        }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: '2px solid #333',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '3px'
          }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ width: '4px', height: '4px', backgroundColor: '#333', borderRadius: '1px' }}></div>
              <div style={{ width: '4px', height: '4px', backgroundColor: '#333', borderRadius: '1px' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ width: '4px', height: '4px', backgroundColor: '#333', borderRadius: '1px' }}></div>
              <div style={{ width: '4px', height: '4px', backgroundColor: '#333', borderRadius: '1px' }}></div>
            </div>
          </div>
        </div>

        {/* Keywords Section */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
            Keywords
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              backgroundColor: '#f0f0f0',
              padding: '4px 8px',
              borderRadius: '3px',
              marginBottom: '6px',
              fontSize: '12px',
              color: '#333'
            }}>
              {year}
              <button 
                onClick={() => handleKeywordRemove(year)}
                style={{ 
                  marginLeft: '6px', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#666'
                }}>×</button>
            </div>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              backgroundColor: '#f0f0f0',
              padding: '4px 8px',
              borderRadius: '3px',
              fontSize: '12px',
              color: '#333',
              marginLeft: '6px'
            }}>
              Gross Profit
              <button 
                onClick={() => handleKeywordRemove('Gross Profit Margin')}
                style={{ 
                  marginLeft: '6px', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#666'
                }}>×</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked readOnly style={{ marginRight: '8px', width: '14px', height: '14px' }} />
              <span style={{ fontSize: '12px', color: '#333' }}>{year}</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked readOnly style={{ marginRight: '8px', width: '14px', height: '14px' }} />
              <span style={{ fontSize: '12px', color: '#333' }}>10Q_Q1</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked readOnly style={{ marginRight: '8px', width: '14px', height: '14px' }} />
              <span style={{ fontSize: '12px', color: '#333' }}>Gross Profit</span>
            </label>
          </div>
        </div>

        {/* Up To Years Slider */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>Up To</span>
            <span style={{ fontSize: '12px', color: '#666' }}>{yearsRange} Years</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={yearsRange}
            onChange={handleYearsRangeChange}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* More Options */}
        <div>
          <h4 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '10px', color: '#333' }}>
            More Options
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Quick & Current Ratios</div>
            <div style={{ fontSize: '12px', color: '#666' }}>ROE: {financialData ? calculateGrossProfitMargin(financialData.net_income_loss, financialData.revenues).toFixed(1) + '%' : 'N/A'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Net Profit: {financialData ? formatCurrency(financialData.net_income_loss) : 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Made more compact */}
      <div style={{ flex: 1, padding: '15px 25px', overflow: 'auto' }}>
        {/* Back Button */}
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            fontSize: '12px',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          ← Back to {companyName}
        </button>

        {/* Top Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginBottom: '25px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#333', fontWeight: '500' }}>10Q_Q1</div>
          <div style={{ fontSize: '12px', color: '#666' }}>10Q_Q2</div>
          <div style={{ fontSize: '12px', color: '#666' }}>10Q_Q3</div>
          <div style={{ fontSize: '12px', color: '#666' }}>10Q_Q4</div>
          <div style={{ fontSize: '12px', color: '#666' }}>10K_{year}</div>
        </div>

        {/* Chart Area - Made more compact */}
        <div style={{ 
          backgroundColor: '#e8e8e8',
          borderRadius: '6px',
          padding: '25px',
          minHeight: '350px',
          position: 'relative'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            textAlign: 'center',
            marginBottom: '30px',
            color: '#000'
          }}>
            Gross Profit/Margin
          </h2>

          {/* Current Gross Profit Margin Display */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Current Margin</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
              {getCurrentGrossProfitMargin()}
            </div>
          </div>

          {/* Histogram - Made more compact */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'center',
            gap: '20px',
            height: '200px',
            paddingBottom: '20px'
          }}>
            {histogramData.map((item) => (
              <div key={item.year} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end'
              }}>
                {/* Bar Value Display */}
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  color: '#000'
                }}>
                  {item.margin.toFixed(1)}%
                </div>
                
                {/* Histogram Bar */}
                <div style={{ 
                  width: '50px',
                  height: item.height,
                  backgroundColor: '#fff',
                  borderRadius: '3px',
                  minHeight: '30px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '6px',
                  position: 'relative'
                }}>
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#000',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    {item.grossProfit}
                  </div>
                </div>
                
                {/* Quarter Label */}
                <div style={{ 
                  fontSize: '11px', 
                  marginTop: '6px',
                  fontWeight: '500',
                  color: '#000'
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Summary - Made more compact */}
        {financialData && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
              Financial Summary - {year}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', fontSize: '12px' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#555', marginBottom: '2px' }}>Revenue</div>
                <div style={{ color: '#333' }}>{formatCurrency(financialData.revenues)}</div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#555', marginBottom: '2px' }}>Gross Profit</div>
                <div style={{ color: '#333' }}>{formatCurrency(financialData.gross_profit)}</div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#555', marginBottom: '2px' }}>Net Income</div>
                <div style={{ color: '#333' }}>{formatCurrency(financialData.net_income_loss)}</div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#555', marginBottom: '2px' }}>Operating Income</div>
                <div style={{ color: '#333' }}>{formatCurrency(financialData.operating_income_loss)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YearlyFinancialReports;