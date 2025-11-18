CREATE TABLE IF NOT EXISTS FinancialAnalysisData (

`    `-- Primary and Foreign Keys

`    `id INTEGER PRIMARY KEY AUTOINCREMENT,

`    `company\_id INTEGER NOT NULL,

`    `FOREIGN KEY (company\_id) REFERENCES PublicCompany(id),

`    `-- Period Information

`    `financial\_year INTEGER NOT NULL,

`    `period\_end\_date DATE NOT NULL,

`    `-- INCOME STATEMENT ITEMS (Your Original Data)

`    `revenues BIGINT,

`    `cost\_of\_revenue BIGINT,

`    `gross\_profit BIGINT,

`    `operating\_expenses BIGINT,

`    `operating\_income\_loss BIGINT,

`    `net\_income\_loss BIGINT,

`    `-- BALANCE SHEET ITEMS (For Solvency & Liquidity)

`    `current\_assets BIGINT,

`    `current\_liabilities BIGINT,

`    `total\_assets BIGINT,

`    `total\_liabilities BIGINT,

`    `total\_equity BIGINT,

`    `long\_term\_debt BIGINT,



`    `-- CASH FLOW STATEMENT ITEMS (For Quality of Earnings)

`    `cash\_flow\_operations BIGINT,

`    `capital\_expenditures BIGINT,

`    `free\_cash\_flow BIGINT,

`    `-- KEY RATIOS & PER SHARE METRICS

`    `eps\_basic NUMERIC(18, 4),

`    `eps\_diluted NUMERIC(18, 4),



`    `-- Profitability Ratios

`    `gross\_margin NUMERIC(18, 4),

`    `operating\_margin NUMERIC(18, 4),

`    `net\_profit\_margin NUMERIC(18, 4),

`    `return\_on\_sales NUMERIC(18, 4),

`    `return\_on\_assets\_roa NUMERIC(18, 4),

`    `return\_on\_equity\_roe NUMERIC(18, 4),

`    `-- Liquidity and Solvency Ratios

`    `current\_ratio NUMERIC(18, 4),

`    `quick\_ratio NUMERIC(18, 4),

`    `debt\_to\_equity\_ratio NUMERIC(18, 4),



`    `-- Market Valuation Metrics (requires input of stock price/market cap data)

`    `price\_to\_earnings\_pe NUMERIC(18, 4),

`    `price\_to\_sales\_ps NUMERIC(18, 4),



`    `-- Unique Constraint

`    `UNIQUE (company\_id, financial\_year, period\_end\_date)

);

