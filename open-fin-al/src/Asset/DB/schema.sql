DROP TABLE IF EXISTS LearningModule;
DROP TABLE IF EXISTS LearningModulePage;

CREATE TABLE IF NOT EXISTS User (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT,
  lastName TEXT,
  username TEXT UNIQUE NOT NULL,
  pinHash TEXT NOT NULL, -- Encrypted/hashed 8-digit PIN
  lastLogin DATETIME,
  dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
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
    assetType TEXT CHECK( assetType IN ('Stock','Bond','ETF','MutualFund','Commodity','Cash') ) NOT NULL DEFAULT 'Stock',
    transactionType TEXT CHECK(transactionType IN ('Buy','Sell')),
    quantity INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transactionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolioId) REFERENCES Portfolio(id)
);

CREATE TABLE IF NOT EXISTS PublicCompany (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    companyName TEXT,
    ticker TEXT NOT NULL UNIQUE,
    cik TEXT NOT NULL,
    isSP500 INTEGER DEFAULT 0
);

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
    minLevel INTEGER NOT NULL,
    riskTag INTEGER NOT NULL,
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
  key INTEGER PRIMARY KEY,
  name TEXT
);

-- which concepts a module teaches (strength ~ 0..1)
CREATE TABLE IF NOT EXISTS LearningModuleConcept (
  moduleId INTEGER,
  conceptKey INTEGER,
  strength REAL DEFAULT 1.0,
  PRIMARY KEY (moduleId, conceptKey)
);

-- track user ↔ module state for STARTED/COMPLETED
CREATE TABLE IF NOT EXISTS UserModule (
  userId INTEGER,
  moduleId INTEGER,
  status TEXT CHECK(status IN ('started','completed')) NOT NULL,
  ts INTEGER NOT NULL,                -- epoch ms
  score REAL,                         -- optional: for COMPLETED edge
  PRIMARY KEY (userId, moduleId, status)
);

-- user knowledge on concepts
CREATE TABLE IF NOT EXISTS UserConcept (
  userId INTEGER,
  conceptKey INTEGER,
  level REAL NOT NULL DEFAULT 0,      -- your scale; confirm later
  updatedAt INTEGER NOT NULL,
  PRIMARY KEY (userId, conceptKey)
);

-- optional: module prerequisites
CREATE TABLE IF NOT EXISTS ModulePrereq (
  moduleId INTEGER,
  requiresModuleId INTEGER,
  PRIMARY KEY (moduleId, requiresModuleId)
);


INSERT OR IGNORE INTO Concept (key, name) VALUES (1, "Investing Strategies");
INSERT OR IGNORE INTO Concept (key, name) VALUES (2, "Stocks");
INSERT OR IGNORE INTO Concept (key, name) VALUES (3, "Bonds");
INSERT OR IGNORE INTO Concept (key, name) VALUES (4, "Risk-Free Investments");
INSERT OR IGNORE INTO Concept (key, name) VALUES (5, "Stock Screening");
INSERT OR IGNORE INTO Concept (key, name) VALUES (6, "Blockchain");

INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (1, "Beginner Stocks", "Learn how stocks work and why people invest in them.", "beginner stocks, accounts, tickers", 10, "Stocks", 1, 3);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (4, "Beginner Bonds", "Understand what bonds are and how they earn returns.", "bonds, fixed income, yield, coupon", 10, "Bonds", 1, 1);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (7, "Beginner Risk-Free Investments", "Explore safe ways to grow your money.", "risk-free, treasuries, CDs, savings", 10, "Risk-Free Investments", 1, 1);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (10, "Beginner Stock Screening", "Discover how to find stocks using basic filters.", "stock screening, filters, factors", 10, "Stock Screening", 1, 2);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (13, "Beginner Blockchain", "Learn how blockchain works and why it matters.", "blockchain beginner, wallets, blocks", 10, "Blockchain", 1, 1);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (2, "Intermediate Stocks", "Study stock valuation and market performance factors.", "stocks, equities, stock market, basics", 12, "Stocks", 2, 3);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (5, "Intermediate Bonds", "Analyze bond types, yields, and market influences.", "bonds, fixed income, yield, coupon", 12, "Bonds", 2, 2);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (8, "Intermediate Risk-Free Investments", "Compare low-risk investment options and strategies.", "risk-free, treasuries, CDs, savings", 12, "Risk-Free Investments", 2, 1);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (11, "Intermediate Stock Screening", "Learn advanced criteria for evaluating stocks.", "stock screening, filters, factors", 12, "Stock Screening", 2, 3);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (14, "Intermediate Blockchain", "Dive deeper into blockchain uses and key technologies.", "blockchain intermediate, smart contracts, tokens", 12, "Blockchain", 2, 1);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (3, "Advanced Stocks", "Apply advanced analysis to stock selection and portfolio design.", "intermediate stocks, valuation, dividends", 15, "Stocks", 3, 3);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (6, "Advanced Bonds", "Assess bond portfolios, pricing models, and risk management.", "bonds, fixed income, yield, coupon", 15, "Bonds", 3, 2);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (9, "Advanced Risk-Free Investments", "Evaluate risk-free rates and portfolio integration methods.", "risk-free, treasuries, CDs, savings", 15, "Risk-Free Investments", 3, 1);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (12, "Advanced Stock Screening", "Build complex screens using technical and fundamental data.", "stock screening, filters, factors", 15, "Stock Screening", 3, 3);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (15, "Advanced Blockchain", "Explore blockchain architecture, consensus, and smart contracts.", "blockchain, crypto basics, consensus", 15, "Blockchain", 3, 2);
INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (16, "Basic Investing Strategies", "Learn core investing habits for long-term growth and stability.", "investing, diversification, goals, strategy", 10, "Investing Strategies", 1, 1);

INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (1, 2, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (2, 2, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (3, 2, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (4, 3, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (5, 3, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (6, 3, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (7, 4, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (8, 4, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (9, 4, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (10, 5, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (11, 5, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (12, 5, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (13, 6, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (14, 6, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (15, 6, 1);
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES (16, 1, 1);

INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (1, 'Beginner Stocks', NULL, 'BeginnerStocks/pdfjs-embed.html', NULL, 1, 'ContentPage');
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (4, 'Beginner Bonds', NULL, 'BeginnerBonds/pdfjs-embed.html', NULL, 1, 'ContentPage');
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (7, 'Beginner Risk-Free Investments', NULL, 'BeginnerRiskFreeInvestments/pdfjs-embed.html', NULL, 1, 'ContentPage');
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (13, 'Beginner Blockchain', NULL, 'BeginnerBlockchain/pdfjs-embed.html', NULL, 1, 'ContentPage');
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (2, 'Intermediate Stocks', NULL, 'IntermediateStocks/pdfjs-embed.html', NULL, 1, 'ContentPage');
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (5, 'Intermediate Bonds', NULL, 'IntermediateBonds/pdfjs-embed.html', NULL, 1, 'ContentPage');
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (8, 'Intermediate Risk-Free Investments', NULL, 'IntermediateRiskFreeInvestments/pdfjs-embed.html', NULL, 1, 'ContentPage');
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (14, 'Intermediate Blockchain', NULL, 'IntermediateBlockchain/pdfjs-embed.html', NULL, 1, 'ContentPage');
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (15, 'Advanced Blockchain', NULL, 'AdvancedBlockchain/pdfjs-embed.html', NULL, 1, 'ContentPage');
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (3, 'Advanced Stocks', NULL, 'AdvancedStocks/pdfjs-embed.html', NULL, 1, 'ContentPage');
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (6, 'Advanced Bonds', NULL, 'AdvancedBonds/pdfjs-embed.html', NULL, 1, 'ContentPage');
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (9, 'Advanced Risk-Free Investments', NULL, 'AdvancedRiskFreeInvestments/pdfjs-embed.html', NULL, 1, 'ContentPage');
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (12, 'Advanced Stock Screening', NULL, 'AdvancedStockScreening/pdfjs-embed.html', NULL, 1, 'ContentPage');
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (11, 'Intermediate Stock Screening', NULL, 'IntermediateStockScreening/pdfjs-embed.html', NULL, 1, 'ContentPage');
INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageContentUrl, voiceoverUrl, pageNumber, pageType) VALUES (10, 'Beginner Stock Screening', NULL, 'BeginnerStockScreening/pdfjs-embed.html', NULL, 1, 'ContentPage');

INSERT OR IGNORE INTO ModulePrereq (moduleId, requiresModuleId) VALUES (2, 1);
INSERT OR IGNORE INTO ModulePrereq (moduleId, requiresModuleId) VALUES (3, 2);
INSERT OR IGNORE INTO ModulePrereq (moduleId, requiresModuleId) VALUES (5, 4);
INSERT OR IGNORE INTO ModulePrereq (moduleId, requiresModuleId) VALUES (6, 5);
INSERT OR IGNORE INTO ModulePrereq (moduleId, requiresModuleId) VALUES (8, 7);
INSERT OR IGNORE INTO ModulePrereq (moduleId, requiresModuleId) VALUES (9, 8);
INSERT OR IGNORE INTO ModulePrereq (moduleId, requiresModuleId) VALUES (11, 10);
INSERT OR IGNORE INTO ModulePrereq (moduleId, requiresModuleId) VALUES (12, 11);
INSERT OR IGNORE INTO ModulePrereq (moduleId, requiresModuleId) VALUES (14, 13);
INSERT OR IGNORE INTO ModulePrereq (moduleId, requiresModuleId) VALUES (15, 14);
