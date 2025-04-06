import React, { useState, useEffect, useRef } from 'react';
import '../index.css';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { Bar } from 'react-chartjs-2';

const StockAnalysis = () => {
  const [searchTerms, setSearchTerms] = useState('');
  const [financialData, setFinancialData] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef();

  const API_KEY = '#';

  const fetchFinancialOverview = async () => {
    try {
      const symbols = searchTerms.split(',').map(s => s.trim().toUpperCase());
      const financialDataArray = [];
      for (const symbol of symbols) {
        const overviewResponse = await fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`);
        if (!overviewResponse.ok) {
          throw new Error(`Failed to fetch financial overview for ${symbol}`);
        }
        const overviewData = await overviewResponse.json();
        if (Object.keys(overviewData).length > 0) {
          financialDataArray.push(overviewData);
        }
      }
      setFinancialData(financialDataArray);
    } catch (error) {
      console.error('Error fetching financial overview:', error);
      setFinancialData([]);
    }
  };

  const handleSearch = () => {
    if (searchTerms.trim() === '') {
      alert('Please enter valid stock symbols separated by commas');
    } else {
      fetchFinancialOverview();
    }
  };

  const handleMetricChange = (event) => {
    const { value, checked } = event.target;
    setSelectedMetrics(prevMetrics =>
      checked ? [...prevMetrics, value] : prevMetrics.filter(metric => metric !== value)
    );
  };

  useEffect(() => {
    if (selectedMetrics.length > 0 && financialData.length > 0) {
      setChartData({
        labels: financialData.map(stock => stock.Symbol),
        datasets: selectedMetrics.map(metric => ({
          label: metric,
          data: financialData.map(stock => parseFloat(stock[metric]) || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }))
      });
    } else {
      setChartData(null);
    }
  }, [selectedMetrics, financialData]);

  const handleExport = (type) => {
    if (financialData.length > 0) {
      if (type === 'csv') {
        const headers = [
          'Symbol', 'Name', 'Fiscal Year End', 'Latest Quarter', 'Market Capitalization', 'EBITDA',
          'P/E Ratio', 'PEG Ratio', 'Book Value', 'Dividend Per Share', 'Dividend Yield', 'EPS',
          'Revenue Per Share TTM', 'Profit Margin', 'Operating Margin TTM', 'Return On Assets TTM',
          'Return On Equity TTM', 'Revenue TTM', 'Gross Profit TTM', '52 Week High', '52 Week Low',
          '50 Day Moving Average', '200 Day Moving Average'
        ];
        const rows = financialData.map(stock => [
          stock.Symbol, stock.Name, stock.FiscalYearEnd, stock.LatestQuarter, stock.MarketCapitalization,
          stock.EBITDA, stock.PERatio, stock.PEGRatio, stock.BookValue, stock.DividendPerShare,
          stock.DividendYield, stock.EPS, stock.RevenuePerShareTTM, stock.ProfitMargin,
          stock.OperatingMarginTTM, stock.ReturnOnAssetsTTM, stock.ReturnOnEquityTTM,
          stock.RevenueTTM, stock.GrossProfitTTM, stock['52WeekHigh'], stock['52WeekLow'],
          stock['50DayMovingAverage'], stock['200DayMovingAverage']
        ].join(','));
        const csvString = `${headers.join(',')}
${rows.join('\n')}`;
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'financial_data.csv');
      } else if (type === 'pdf') {
        const input = chartRef.current;
        html2canvas(input).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdfWindow = window.open('');
          pdfWindow.document.write('<img src="' + imgData + '" />');
        });
      }
    } else {
      alert('No data available to export');
    }
  };

  return (
    <div className="page">
      <h2><span className="material-icons">assessment</span> Stock Comparison</h2>
      <div className="stock-analysis">
        <div className="search-bar" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search by ticker symbols (e.g., MSFT, AAPL, IBM)..."
            value={searchTerms}
            onChange={(e) => setSearchTerms(e.target.value)}
            style={{ width: '400px', height: '30px', padding: '5px', fontSize: '16px' }}
          />
          <button onClick={handleSearch} style={{ marginLeft: '10px', padding: '5px 15px', fontSize: '16px' }}>Search</button>
        </div>
        {financialData.length > 0 && (
          <div className="search-result" ref={chartRef}>
            <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Symbol</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Market Capitalization</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>EBITDA</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>P/E Ratio</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>PEG Ratio</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Book Value</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Dividend Per Share</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>EPS</th>
                </tr>
              </thead>
              <tbody>
                {financialData.map((stock) => (
                  <tr key={stock.Symbol}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.Symbol}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.Name || 'N/A'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>${stock.MarketCapitalization || 'N/A'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>${stock.EBITDA || 'N/A'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.PERatio || 'N/A'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.PEGRatio || 'N/A'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.BookValue || 'N/A'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>${stock.DividendPerShare || 'N/A'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.EPS || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {chartData && (
              <div className="stock-chart" style={{ marginTop: '40px' }}>
                <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
              </div>
            )}
          </div>
        )}
        <div className="export-buttons" style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={() => handleExport('csv')} style={{ marginRight: '10px', padding: '10px 20px', fontSize: '16px' }}>Export to CSV</button>
          <button onClick={() => handleExport('pdf')} style={{ padding: '10px 20px', fontSize: '16px' }}>Export to PDF</button>
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis;