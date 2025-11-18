import { ISqlDataGateway } from "../ISqlDataGateway";
import { SQLiteCompanyLookupGateway } from "./SQLiteCompanyLookupGateway";
import { IEntity } from "@Entity/IEntity";

export class SQLiteTableCreationGateway implements ISqlDataGateway {
    connection: any = null;
    sourceName: string = "SQLite Database";

    async connect(): Promise<void> {
        throw new Error("Due to the nature of this gateway's dependencies, connections are not handled through this method");
    }

    disconnect(): void {
        throw new Error("Due to the nature of this gateway's dependencies, connections and disconnections are not handled through this method");
    }

    // used to create and periodically refresh the cache
    async create(): Promise<Boolean> {
        const sqlSchema = `
            DROP TABLE IF EXISTS LearningModule;
            DROP TABLE IF EXISTS LearningModulePage;
            DROP TABLE IF EXISTS Portfolio;
            DROP TABLE IF EXISTS User;

            CREATE TABLE IF NOT EXISTS User (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                firstName TEXT,
                lastName TEXT,
                email TEXT,
                username TEXT UNIQUE NOT NULL,
                pinHash TEXT,
                lastLogin TIMESTAMP,
                dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                overallKnowledgeLevel TEXT,
                riskScore TEXT,
            );
 
            CREATE TABLE IF NOT EXISTS CertAuthMetaData (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT UNIQUE NOT NULL,
                dateLastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TRIGGER IF NOT EXISTS UpdateCertAuthMetaDataTimestamp
            AFTER UPDATE ON CertAuthMetaData
            FOR EACH ROW
            BEGIN
                UPDATE CertAuthMetaData
                SET dateLastModified = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;

            CREATE TABLE IF NOT EXISTS Portfolio (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                userId INTEGER NOT NULL,
                isDefault INTEGER DEFAULT 0,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES User(id)
            );

            CREATE TRIGGER IF NOT EXISTS AutoSetFirstPortfolioDefault
            AFTER INSERT ON Portfolio
            WHEN (
                SELECT COUNT(*) FROM Portfolio
                WHERE userId = NEW.userId
            ) = 1
            BEGIN
                UPDATE Portfolio
                SET isDefault = 1
                WHERE id = NEW.id;
            END;

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

            CREATE TABLE IF NOT EXISTS Asset (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                name TEXT,
                type TEXT CHECK(type IN ('Stock','Bond','ETF','MutualFund','Commodity','Cash')) NOT NULL,
                cik TEXT,
                isSP500 INTEGER DEFAULT 0,
                UNIQUE(symbol, type)
            );

            CREATE TABLE IF NOT EXISTS PublicCompany (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                companyName TEXT,
                ticker TEXT NOT NULL UNIQUE,
                cik TEXT NOT NULL,
                isSP500 INTEGER DEFAULT 0
            );

            INSERT OR IGNORE INTO ASSET (symbol, name, type) VALUES ('Cash','Cash','Cash');

            CREATE TABLE IF NOT EXISTS AssetOrder(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                assetId INTEGER NOT NULL,
                portfolioId INTEGER NOT NULL,
                orderType TEXT CHECK(orderType IN ('Buy','Sell')) DEFAULT Buy NOT NULL,
                orderMethod TEXT CHECK(orderMethod IN ('Market','Limit','Stop','StopLimit')) DEFAULT Market NOT NULL,
                orderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                quantity DECIMAL(12, 6) NOT NULL,
                lastPrice DECIMAL(10,2),
                lastPriceDate DATE DEFAULT CURRENT_DATE,
                limitPrice DECIMAL(10,2),
                stopPrice DECIMAL(10,2),
                fulfilled INTEGER DEFAULT 0,
                fulfilledDate TIMESTAMP,
                FOREIGN KEY (assetId) REFERENCES Asset(id),
                FOREIGN KEY (portfolioId) REFERENCES Portfolio(id)
            );

            CREATE INDEX IF NOT EXISTS idx_assetorder_asset ON AssetOrder(assetId);
            CREATE INDEX IF NOT EXISTS idx_assetorder_portfolio ON AssetOrder(portfolioId);

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

            CREATE TABLE IF NOT EXISTS Meta (
                key TEXT PRIMARY KEY,
                value TEXT
            );

            CREATE TABLE IF NOT EXISTS Concept (
                key INTEGER PRIMARY KEY,
                name TEXT
            );

            CREATE TABLE IF NOT EXISTS LearningModuleConcept (
                moduleId INTEGER,
                conceptKey INTEGER,
                strength REAL DEFAULT 1.0,
                PRIMARY KEY (moduleId, conceptKey)
            );

            CREATE TABLE IF NOT EXISTS UserModule (
                userId INTEGER,
                moduleId INTEGER,
                status TEXT CHECK(status IN ('started','completed')) NOT NULL,
                ts INTEGER NOT NULL,
                score REAL,
                PRIMARY KEY (userId, moduleId, status)
            );

            CREATE TABLE IF NOT EXISTS UserConcept (
                userId INTEGER,
                conceptKey INTEGER,
                level REAL NOT NULL DEFAULT 0,      -- your scale; confirm later
                updatedAt INTEGER NOT NULL,
                PRIMARY KEY (userId, conceptKey)
            );

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

        `;

        var result = await window.database.SQLiteInit(sqlSchema);

        return result;
    }

    async read(): Promise<IEntity[]> {
        throw new Error("This gatweay does not allow for reading. This gateway is designed for posting only.");
    }

    update(entity: IEntity, action: string): Promise<number> {
        throw new Error("This gateway does not have the ability to update content. Updates are handled by periodically deleting and re-entering data");
    }

    async delete(entity: IEntity, action: string): Promise<number> {
        throw new Error("This gatweay does not allow deleting data. This gateway is designed for posting only.");
    }

    //check to see if the database exists
    async checkTableExists() {
        try {
            var interactor = new SQLiteCompanyLookupGateway();
            if(interactor.checkTableExists()) {
                return true;
            } else {
                return false;
            }
        } catch(error) {
            return false;
        }
    }

    //for database tables that act as cache, check for the last time a table was updated
    async checkLastTableUpdate():Promise<any> {
        throw new Error("This gatweay does not allow for checking tables. This gateway is designed for posting only.");
        return null;
    }

    async refreshTableCache(entity: IEntity):Promise<Boolean> {
        throw new Error("This gatweay does not allow for rereshing tables. This gateway is designed for posting only.");
        return false;
    }
}
