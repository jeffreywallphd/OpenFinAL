DROP TABLE IF EXISTS LearningModule;
DROP TABLE IF EXISTS LearningModulePage;

CREATE TABLE IF NOT EXISTS User (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT,
  lastName TEXT,
  username TEXT UNIQUE NOT NULL
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


-- INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (1, "Introduction to Stocks", "This learning module provides you with an introduction to stocks and the stock market.", "stock market", 10, "Stock","1","1");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (1, "Introduction to Stocks", "What is a Stock and What Happens When you Invest?", 1, "TitlePage");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, pageNumber) VALUES (1, "Topics Covered", "Stocks/Slide2.html", 2);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageNumber, pageType) VALUES (1, "What is a Stock?", 3, "SectionPage");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (1, "Stock Shareholders", "Stocks/Slide4.html", "Stocks/Slide4_Stocks.mp3", 4);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (1, "Stock Value", "Stocks/Slide5.html", "Stocks/Slide5_Stocks.mp3", 5);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageNumber, pageType) VALUES (1, "Dividends", 6, "SectionPage");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (1, "What is a Dividend", "Stocks/Slide7.html", "Stocks/Slide7_Stocks.mp3", 7);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageNumber, pageType) VALUES (1, "How to Invest", 8, "SectionPage");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (1, "Buying and Selling Stock", "Stocks/Slide9.html", "Stocks/Slide9_Stocks.mp3", 9);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (1, "How to Invest in Common Stock", "Stocks/Slide10.html", "Stocks/Slide10_Stocks.mp3", 10);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (1, "Stock Options", "Stocks/Slide11.html", "Stocks/Slide11_Stocks.mp3", 11);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (1, "Returns", "Stocks/Slide12.html", "Stocks/Slide12_Stocks.mp3", 12);

-- INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (2, "Introduction to Bonds", "This learning module provides you with an introduction to bonds.", "bonds investment introduction", 10, "Bond","1","1");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (2, "Introduction to Bonds", "What is a Bond?", 1, "TitlePage");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, pageNumber) VALUES (2, "Topics Covered", "Bonds/Slide2.html",2);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (2, "Bonds", "What they are", 3, "SectionPage");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (2, "Definitions and Explanations", "Bonds/Slide4.html", "Bonds_Voiceovers/Slide4_Bonds.mp3", 4);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (2, "Important to Note about Bonds", "Bonds/Slide5.html", "Bonds_Voiceovers/Slide5_Bonds.mp3", 5);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (2, "Bond Maturity: What is it?", "Bonds/Slide6.html", "Bonds_Voiceovers/Slide6_Bonds.mp3", 6);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (2, "Bonds", "The Different Types", 7, "SectionPage");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (2, "Types of Bonds", "Bonds/Slide8.html", "Bonds_Voiceovers/Slide8_Bonds.mp3", 8);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (2, "Zero Coupon Bonds", "Bonds/Slide9.html", "Bonds_Voiceovers/Slide9_Bonds.mp3", 9);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (2, "How Bonds Interact with Taxes", "Bonds/Slide10.html", "bonds_Voiceovers/Slide10_Bonds.mp3", 10);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (2, "Bonds", "The Risks", 11, "SectionPage");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (2, "Two Main Risks", "Bonds/Slide12.html", "Bonds_Voiceovers/Slide12_Bonds.mp3", 12);

-- INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (7, "What is stock screening?", "This learning module provides you with an introduction to stock screening.", "stock screening introduction", 10, "Stock Screening","1","1");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, pageNumber) VALUES (7, "Topics Covered", "StockScreening/Slide2.html",1);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (7, "Market Beta", "StockScreening/Slide3.html", "StockScreening/StockScreeningSlide3.mp3", 2);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (7, "Stock Screening", "Market Beta", 3, "SectionPage");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (7, "Ratios", "StockScreening/Slide4.html", "StockScreening/StockScreeningSlide4.mp3", 4);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (7, "Build Your own Strategy", "StockScreening/Slide5.html", "StockScreening/StockScreeningSlide5.mp3", 5);

-- INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, minLevel, riskTag)VALUES (8, "Basics of Blockchain", "This learning module provides you with an introduction to blockchain.", "blockchain introduction", 10, "Blockchain","1","1");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (8, "A Beginner's Overview To Blockchain", "Blockchain/Slide2.html", "Blockchain/BlockchainSlide2.mp3", 1);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (8, "Blockchain Basics", "Blockchain/Slide3.html", "Blockchain/BlockchainSlide3.mp3", 2);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, subTitle, pageNumber, pageType) VALUES (8, "How to invest in Crypto and NFTs?", "Multiple exchanges and opportunities!", 3, "SectionPage");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (8, "Ratios", "Blockchain/Slide4.html", "Blockchain/BlockchainSlide4.mp3", 4);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (8, "Crypto and NFTs", "Blockchain/Slide5.html", "Blockchain/BlockchainSlide5.mp3", 5);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (8, "Risks and Obligations", "Blockchain/Slide6.html", "Blockchain/BlockchainSlide6.mp3", 6);

-- INSERT OR IGNORE INTO LearningModule (id,title, description, keywords, timeEstimate, category, minLevel, riskTag) VALUES (4, "Risk Free Investments", "This learning module provides you with some helpful information about risk free investments", "risk free investments", 10, "Risk Free Investments","1","1");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, pageNumber) VALUES (4, "Topics Covered", "RiskFreeInvestments/Slide1.html", 1);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageNumber, pageType) VALUES (4, "What are risk free investments?", 2, "SectionPage");
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (4, "What types are there?", "RiskFreeInvestments/Slide3.html", "RiskFreeInvestments/Slide3_RiskFree.mp3", 3);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (4, "What does each type do? Savings Accounts", "RiskFreeInvestments/Slide4.html", "RiskFreeInvestments/Slide4_RiskFree.mp3", 4);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (4, "What does each type do? Treasury Bills", "RiskFreeInvestments/Slide5.html", "RiskFreeInvestments/Slide5_RiskFree.mp3", 5);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (4, "What does each type do? Treasury Bonds", "RiskFreeInvestments/Slide6.html", "RiskFreeInvestments/Slide6_RiskFree.mp3", 6);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (4, "What does each type do? Money Market", "RiskFreeInvestments/Slide7.html", "RiskFreeInvestments/Slide7_RiskFree.mp3", 7);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (4, "What does each type do? CD's", "RiskFreeInvestments/Slide8.html", "RiskFreeInvestments/Slide8_RiskFree.mp3", 8);
-- INSERT OR IGNORE INTO LearningModulePage (moduleId, title, pageContentUrl, voiceoverUrl, pageNumber) VALUES (4, "How safe are they?", "RiskFreeInvestments/Slide9.html", "RiskFreeInvestments/Slide9_RiskFree.mp3", 9);

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

INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("1", "2", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("2", "2", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("3", "2", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("4", "3", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("5", "3", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("6", "3", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("7", "4", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("8", "4", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("9", "4", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("10", "5", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("11", "5", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("12", "5", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("13", "6", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("14", "6", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("15", "6", "1");
INSERT OR IGNORE INTO LearningModuleConcept (moduleId, conceptKey, strength) VALUES ("16", "1", "1");

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