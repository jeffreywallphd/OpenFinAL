CREATE TABLE IF NOT EXISTS FinancialData (
    -- Primary Key for this table
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Financial and Date Information
    financial_year INTEGER NOT NULL,
    period_end_date DATE,

    -- Monetary Values (using BIGINT for large whole numbers)
    revenues BIGINT,
    cost_of_revenue BIGINT,
    gross_profit BIGINT,
    operating_expenses BIGINT,
    operating_income_loss BIGINT,
    net_income_loss BIGINT,

    -- Ratio and Per-Share Values (using NUMERIC for decimal precision)
    eps_basic NUMERIC(15, 4),
    eps_diluted NUMERIC(15, 4),
    gross_margin NUMERIC(15, 4),
    operating_margin NUMERIC(15, 4),
    net_profit_margin NUMERIC(15, 4),
    return_on_sales NUMERIC(15, 4),

    -- Optional: Enforce that a company cannot have more than one record for the same year
    UNIQUE (company_id, financial_year, period_end_date)

    -- Foreign Key to the PublicCompany table
    company_id INTEGER NOT NULL,
    FOREIGN KEY (company_id) REFERENCES PublicCompany(id),
);


