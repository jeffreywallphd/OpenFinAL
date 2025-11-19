DROP TABLE IF EXISTS LearningModule;
DROP TABLE IF EXISTS LearningModulePage;

CREATE TABLE IF NOT EXISTS User (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  username TEXT UNIQUE NOT NULL,
  pinHash TEXT NOT NULL, -- Encrypted/hashed 8-digit PIN (required for authentication)
  lastLogin DATETIME,
  dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  overallKnowledgeLevel TEXT,
  riskTolerance TEXT CHECK(riskTolerance IN ('low', 'low/mid', 'mid', 'mid/high', 'high')) DEFAULT 'low'
);

CREATE TABLE IF NOT EXISTS Portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    userId INTEGER NOT NULL,
    isDefault INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TRIGGER IF NOT EXISTS SetDefaultPortfolio
AFTER UPDATE OF isDefault ON Portfolio
WHEN NEW.isDefault = 1
BEGIN
    UPDATE Portfolio
    SET isDefault = 0
    WHERE userId = NEW.userId
      AND id != NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS SetDefaultPortfolioOnInsert
AFTER INSERT ON Portfolio
WHEN NEW.isDefault = 1
BEGIN
    UPDATE Portfolio
    SET isDefault = 0
    WHERE userId = NEW.userId
      AND id != NEW.id;
END;

CREATE TABLE IF NOT EXISTS PortfolioTransaction (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolioId INTEGER NOT NULL,
    transactionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type TEXT CHECK(type IN ('Deposit','Withdraw','Buy','Sell','Dividend')) NOT NULL,
    note TEXT,
    isCanceled INTEGER DEFAULT 0,
    FOREIGN KEY (portfolioId) REFERENCES Portfolio(id)
);

CREATE TABLE IF NOT EXISTS PortfolioTransactionEntry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transactionId INTEGER NOT NULL,
    assetId INTEGER NOT NULL,
    side TEXT CHECK(side IN ('debit', 'credit')) NOT NULL,
    quantity DECIMAL(12, 6) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    amount AS (quantity * price) STORED,
    FOREIGN KEY (transactionId) REFERENCES PortfolioTransaction(id),
    FOREIGN KEY (assetId) REFERENCES Asset(id)
);

CREATE INDEX IF NOT EXISTS idx_transaction_portfolio ON PortfolioTransaction(portfolioId);
CREATE INDEX IF NOT EXISTS idx_entry_transaction ON PortfolioTransactionEntry(transactionId);
CREATE INDEX IF NOT EXISTS idx_entry_asset ON PortfolioTransactionEntry(assetId);

CREATE TABLE IF NOT EXISTS PublicCompany (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    companyName TEXT,
    ticker TEXT NOT NULL UNIQUE,
    cik TEXT NOT NULL,
    isSP500 INTEGER DEFAULT 0
);

/*Asset table for caching stock/asset data*/
CREATE TABLE IF NOT EXISTS Asset (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    symbol TEXT NOT NULL,
    cik TEXT,
    type TEXT CHECK(type IN ('Stock','Bond','ETF','MutualFund','Commodity','Cash')) NOT NULL DEFAULT 'Stock',
    isSP500 INTEGER DEFAULT 0,
    UNIQUE(symbol, type)
);

/*create a trigger to update the modifications table when Delete occurs on Asset*/
CREATE TRIGGER IF NOT EXISTS AssetOnDelete AFTER DELETE ON Asset
BEGIN
    INSERT INTO modifications (tableName, action) VALUES ('Asset','DELETE');
END;

/*create a table to track changes to some tables that act as cache*/
CREATE TABLE IF NOT EXISTS modifications (
    tableName TEXT NOT NULL PRIMARY KEY ON CONFLICT REPLACE,
    action TEXT NOT NULL,
    changedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*create a trigger to update the modificaitons table when Delete occurs on PublicCompany*/
CREATE TRIGGER IF NOT EXISTS PublicCompanyOnDelete AFTER DELETE ON PublicCompany
BEGIN
    INSERT INTO modifications (tableName, action) VALUES ('PublicCompany','DELETE');
END;

CREATE TABLE IF NOT EXISTS LearningModule(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    keywords TEXT NOT NULL,
    timeEstimate REAL NOT NULL,
    category TEXT NOT NULL,
    minLevel TEXT NOT NULL,
    riskTag TEXT NOT NULL,
    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS LearningModulePage(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    moduleId INTEGER NOT NULL,
    title TEXT NOT NULL,
    subTitle TEXT,
    pageContentUrl TEXT,
    voiceoverUrl TEXT,
    pageNumber INTEGER NOT NULL,
    pageType TEXT CHECK(pageType IN ("TitlePage","SectionPage","ContentPage")) DEFAULT 'ContentPage',
    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (moduleId) REFERENCES LearningModule(id)
);

CREATE TABLE IF NOT EXISTS LearningModuleQuiz(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    moduleId INTEGER NOT NULL,
    FOREIGN KEY (moduleId) REFERENCES LearningModule(id)
);

CREATE TABLE IF NOT EXISTS LearningModuleQuizQuestion(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    moduleQuizId INTEGER NOT NULL,
    question TEXT NOT NULL,
    option1 TEXT,
    option2 TEXT,
    option3 TEXT,
    option4 TEXT,
    option5 TEXT,
    option6 TEXT,
    correctOption INTEGER,
    explanation TEXT,
    FOREIGN KEY (moduleQuizId) REFERENCES LearningModuleQuiz(id)
);

CREATE TABLE IF NOT EXISTS LearningModuleQuizCompletion(
    userId INTEGER NOT NULL,
    moduleQuizId INTEGER NOT NULL,
    PRIMARY KEY (userId, moduleQuizId)
    FOREIGN KEY (moduleQuizId) REFERENCES LearningModuleQuiz(id)
    FOREIGN KEY (userId) REFERENCES User(id)
);

-- keeps last successful sync timestamp
CREATE TABLE IF NOT EXISTS Meta (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- optional: concept dictionary (if you don’t want to derive from category)
CREATE TABLE IF NOT EXISTS Concept (
  key TEXT PRIMARY KEY,
  name TEXT
);

-- which concepts a module teaches (strength ~ 0..1)
CREATE TABLE IF NOT EXISTS LearningModuleConcept (
  moduleId TEXT,
  conceptKey TEXT,
  strength REAL DEFAULT 1.0,
  PRIMARY KEY (moduleId, conceptKey)
);

-- track user ↔ module state for STARTED/COMPLETED
CREATE TABLE IF NOT EXISTS UserModule (
  userId TEXT,
  moduleId TEXT,
  status TEXT CHECK(status IN ('started','completed')) NOT NULL,
  ts INTEGER NOT NULL,                -- epoch ms
  score REAL,                         -- optional: for COMPLETED edge
  PRIMARY KEY (userId, moduleId, status)
);

-- user knowledge on concepts
CREATE TABLE IF NOT EXISTS UserConcept (
  userId TEXT,
  conceptKey TEXT,
  level REAL NOT NULL DEFAULT 0,      -- your scale; confirm later
  updatedAt INTEGER NOT NULL,
  PRIMARY KEY (userId, conceptKey)
);

-- optional: module prerequisites
CREATE TABLE IF NOT EXISTS ModulePrereq (
  moduleId TEXT,
  requiresModuleId TEXT,
  PRIMARY KEY (moduleId, requiresModuleId)
);

INSERT OR IGNORE INTO Concept (key, name) VALUES ("1", "Stocks");
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (1, "Introduction to Stocks", "This learning module provides you with an introduction to stocks and the stock market.", "stock market", 10, "Stock","1","1");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (1, "Introduction to Stocks", "What is a Stock and What Happens When you Invest?", 1, "TitlePage");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, pageNumber) VALUES (1, "Topics Covered", "Stocks/Slide2.html", 2);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageNumber, pageType) VALUES (1, "What is a Stock?", 3, "SectionPage");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (1, "Stock Shareholders", "Stocks/Slide4.html", "Stocks/Slide4_Stocks.mp3", 4);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (1, "Stock Value", "Stocks/Slide5.html", "Stocks/Slide5_Stocks.mp3", 5);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageNumber, pageType) VALUES (1, "Dividends", 6, "SectionPage");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (1, "What is a Dividend", "Stocks/Slide7.html", "Stocks/Slide7_Stocks.mp3", 7);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageNumber, pageType) VALUES (1, "How to Invest", 8, "SectionPage");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (1, "Buying and Selling Stock", "Stocks/Slide9.html", "Stocks/Slide9_Stocks.mp3", 9);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (1, "How to Invest in Common Stock", "Stocks/Slide10.html", "Stocks/Slide10_Stocks.mp3", 10);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (1, "Stock Options", "Stocks/Slide11.html", "Stocks/Slide11_Stocks.mp3", 11);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (1, "Returns", "Stocks/Slide12.html", "Stocks/Slide12_Stocks.mp3", 12);

INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (2, "Introduction to Bonds", "This learning module provides you with an introduction to bonds.", "bonds investment introduction", 10, "Bond","1","1");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (2, "Introduction to Bonds", "What is a Bond?", 1, "TitlePage");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, pageNumber) VALUES (2, "Topics Covered", "Bonds/Slide2.html",2);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (2, "Bonds", "What they are", 3, "SectionPage");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (2, "Definitions and Explanations", "Bonds/Slide4.html", "Bonds_Voiceovers/Slide4_Bonds.mp3", 4);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (2, "Important to Note about Bonds", "Bonds/Slide5.html", "Bonds_Voiceovers/Slide5_Bonds.mp3", 5);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (2, "Bond Maturity: What is it?", "Bonds/Slide6.html", "Bonds_Voiceovers/Slide6_Bonds.mp3", 6);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (2, "Bonds", "The Different Types", 7, "SectionPage");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (2, "Types of Bonds", "Bonds/Slide8.html", "Bonds_Voiceovers/Slide8_Bonds.mp3", 8);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (2, "Zero Coupon Bonds", "Bonds/Slide9.html", "Bonds_Voiceovers/Slide9_Bonds.mp3", 9);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (2, "How Bonds Interact with Taxes", "Bonds/Slide10.html", "bonds_Voiceovers/Slide10_Bonds.mp3", 10);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (2, "Bonds", "The Risks", 11, "SectionPage");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (2, "Two Main Risks", "Bonds/Slide12.html", "Bonds_Voiceovers/Slide12_Bonds.mp3", 12);

INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (7, "What is stock screening?", "This learning module provides you with an introduction to stock screening.", "stock screening introduction", 10, "Stock Screening","1","1");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, pageNumber) VALUES (7, "Topics Covered", "StockScreening/Slide2.html",1);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (7, "Market Beta", "StockScreening/Slide3.html", "StockScreening/StockScreeningSlide3.mp3", 2);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (7, "Stock Screening", "Market Beta", 3, "SectionPage");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (7, "Ratios", "StockScreening/Slide4.html", "StockScreening/StockScreeningSlide4.mp3", 4);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (7, "Build Your own Strategy", "StockScreening/Slide5.html", "StockScreening/StockScreeningSlide5.mp3", 5);

INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag)VALUES (8, "Basics of Blockchain", "This learning module provides you with an introduction to blockchain.", "blockchain introduction", 10, "Blockchain","1","1");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (8, "A Beginner's Overview To Blockchain", "Blockchain/Slide2.html", "Blockchain/BlockchainSlide2.mp3", 1);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (8, "Blockchain Basics", "Blockchain/Slide3.html", "Blockchain/BlockchainSlide3.mp3", 2);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (8, "How to invest in Crypto and NFTs?", "Multiple exchanges and opportunities!", 3, "SectionPage");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (8, "Ratios", "Blockchain/Slide4.html", "Blockchain/BlockchainSlide4.mp3", 4);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (8, "Crypto and NFTs", "Blockchain/Slide5.html", "Blockchain/BlockchainSlide5.mp3", 5);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (8, "Risks and Obligations", "Blockchain/Slide6.html", "Blockchain/BlockchainSlide6.mp3", 6);

INSERT OR IGNORE INTO LearningModule (id,title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (4, "Risk Free Investments", "This learning module provides you with some helpful information about risk free investments", "risk free investments", 10, "Risk Free Investments","1","1");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, pageNumber) VALUES (4, "Topics Covered", "RiskFreeInvestments/Slide1.html", 1);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageNumber, pageType) VALUES (4, "What are risk free investments?", 2, "SectionPage");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (4, "What types are there?", "RiskFreeInvestments/Slide3.html", "RiskFreeInvestments/Slide3_RiskFree.mp3", 3);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (4, "What does each type do? Savings Accounts", "RiskFreeInvestments/Slide4.html", "RiskFreeInvestments/Slide4_RiskFree.mp3", 4);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (4, "What does each type do? Treasury Bills", "RiskFreeInvestments/Slide5.html", "RiskFreeInvestments/Slide5_RiskFree.mp3", 5);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (4, "What does each type do? Treasury Bonds", "RiskFreeInvestments/Slide6.html", "RiskFreeInvestments/Slide6_RiskFree.mp3", 6);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (4, "What does each type do? Money Market", "RiskFreeInvestments/Slide7.html", "RiskFreeInvestments/Slide7_RiskFree.mp3", 7);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (4, "What does each type do? CD's", "RiskFreeInvestments/Slide8.html", "RiskFreeInvestments/Slide8_RiskFree.mp3", 8);
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (4, "How safe are they?", "RiskFreeInvestments/Slide9.html", "RiskFreeInvestments/Slide9_RiskFree.mp3", 9);

INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category) VALUES (5, "ETF Fundamentals", "What ETFs are, tracking error, and how to evaluate expense ratios.", "etf exchange traded funds expense ratios", 14, "Index");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (5, "ETF Fundamentals", "Understanding Exchange-Traded Funds", 1, "TitlePage");

INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category) VALUES (6, "Intro to Options", "Calls vs puts, Greeks, and risk management considerations.", "options calls puts greeks risk", 18, "Stock");
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (6, "Intro to Options", "Options Trading Basics", 1, "TitlePage");
