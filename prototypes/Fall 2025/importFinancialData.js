const XLSX = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'OpenFinAL', 'OpenFinAL.sqlite');
const excelPath = path.join(__dirname, '..', 'Fall 2025', 'financial_data.xlsx');

function importData() {
    const db = new sqlite3.Database(dbPath);
    
    // Read Excel file
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    const insertSQL = `
        INSERT OR REPLACE INTO FinancialData 
        (ticker, cik, company_name, year, revenues, revenues_period_end, cost_of_revenue, 
         operating_expenses, net_income_loss, earnings_per_share_basic, earnings_per_share_diluted,
         gross_profit, operating_income_loss)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    data.forEach(row => {
        db.run(insertSQL, [
            row.Ticker, row.CIK, row.Company, row.Year, row.Revenues, 
            row['Revenues (PeriodEnd)'], row.CostOfRevenue, row.OperatingExpenses,
            row.NetIncomeLoss, row.EarningsPerShareBasic, row.EarningsPerShareDiluted,
            row.GrossProfit, row.OperatingIncomeLoss
        ], function(err) {
            if (err) {
                console.error(`Error inserting ${row.Ticker} ${row.Year}:`, err);
            } else {
                console.log(`Inserted ${row.Ticker} ${row.Year}`);
            }
        });
    });
    
    db.close();
}

importData();
