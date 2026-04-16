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
                dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                fileName TEXT,
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

            INSERT OR IGNORE INTO LearningModule (id, title, description, keywords, timeEstimate, category, fileName) VALUES (9, "Introduction to Investing", "What is investing? This module will explore the foundations of investing and how you can get started", "investing stocks bonds ETFs mutal funds", 10, "ETF", "IntroductionToInvesting.pptx");
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