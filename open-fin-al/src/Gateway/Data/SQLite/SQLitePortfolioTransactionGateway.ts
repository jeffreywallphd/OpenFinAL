import {IEntity} from "../../../Entity/IEntity";
import {ISqlDataGateway} from "../ISqlDataGateway";
import { Asset } from "../../../Entity/Asset";
import { Portfolio } from "../../../Entity/Portfolio";

// allow the yahoo.finance contextBridge to be used in TypeScript
declare global {
    interface Window { electron: any }
}

export class SQLitePortfolioTransactionGateway implements ISqlDataGateway {
    connection: any = null;
    sourceName: string = "SQLite Database";

    async connect(): Promise<void> {
        throw new Error("Due to the nature of this gateway's dependencies, connections are not handled through this method");
    }

    disconnect(): void {
        throw new Error("Due to the nature of this gateway's dependencies, connections and disconnections are not handled through this method");
    }

    // used to create and periodically refresh the cache
    async create(entity: IEntity, action: string): Promise<any> {
        var transactionQuery="";
        var transactionQueryParameters = [];

        var debitTransactionEntryQuery="";
        var debitTransactionEntryQueryParameters = [];

        var creditTransactionEntryQuery="";
        var creditTransactionEntryQueryParameters = [];

        try {
            if(action==="deposit") {
                //transaction query
                transactionQuery = "INSERT INTO PortfolioTransaction (portfolioId,type,note) VALUES (?,?,?)";
                transactionQueryParameters = [
                    entity.getFieldValue("portfolioId"),
                    entity.getFieldValue("type"),
                    entity.getFieldValue("note")
                ];

                const result = await window.database.SQLiteInsert({ query: transactionQuery, parameters: transactionQueryParameters });
                var entryResult;

                if(result && result.ok) {
                    //insert transaction entries
                    const transactionId = result.lastID;

                    //insert debit transaction entry
                    const debitEntity = entity.getFieldValue("debitEntry");
                    debitTransactionEntryQuery = "INSERT INTO PortfolioTransactionEntry (transactionId,assetId,side,quantity,price) VALUES (?,?,?,?,?)";
                    debitTransactionEntryQueryParameters = [
                        transactionId,
                        debitEntity.getFieldValue("assetId"),
                        "debit",
                        debitEntity.getFieldValue("quantity"),
                        debitEntity.getFieldValue("price")
                    ];

                    entryResult = await window.database.SQLiteInsert({ query: debitTransactionEntryQuery, parameters: debitTransactionEntryQueryParameters });
                } 

                if(entryResult && entryResult.ok) {
                    return true;
                }
                return entryResult;
            } else if(action==="purchaseAsset") {
                //transaction query
                transactionQuery = "INSERT INTO PortfolioTransaction (portfolioId,type,note) VALUES (?,?,?)";
                transactionQueryParameters = [
                    entity.getFieldValue("portfolioId"),
                    entity.getFieldValue("type"),
                    entity.getFieldValue("note")
                ];

                const result = await window.database.SQLiteInsert({ query: transactionQuery, parameters: transactionQueryParameters });
                var debitEntryResult;
                var creditEntryResult;

                if(result && result.ok) {
                    //insert transaction entries
                    const transactionId = result.lastID;

                    //insert debit transaction entry
                    const debitEntity = entity.getFieldValue("debitEntry");
                    debitTransactionEntryQuery = "INSERT INTO PortfolioTransactionEntry (transactionId,assetId,side,quantity,price) VALUES (?,?,?,?,?)";
                    debitTransactionEntryQueryParameters = [
                        transactionId,
                        debitEntity.getFieldValue("assetId"),
                        "debit",
                        debitEntity.getFieldValue("quantity"),
                        debitEntity.getFieldValue("price")
                    ];

                    debitEntryResult = await window.database.SQLiteInsert({ query: debitTransactionEntryQuery, parameters: debitTransactionEntryQueryParameters });

                    //insert credit transaction entry to credit Cash
                    const creditEntity = entity.getFieldValue("creditEntry");
                    creditTransactionEntryQuery = "INSERT INTO PortfolioTransactionEntry (transactionId,assetId,side,quantity,price) VALUES (?,?,?,?,?)";
                    creditTransactionEntryQueryParameters = [
                        transactionId,
                        creditEntity.getFieldValue("assetId"),
                        "credit",
                        1,
                        creditEntity.getFieldValue("price") * creditEntity.getFieldValue("quantity")
                    ];

                    creditEntryResult = await window.database.SQLiteInsert({ query: creditTransactionEntryQuery, parameters: creditTransactionEntryQueryParameters });
                } 

                if(debitEntryResult && debitEntryResult.ok && creditEntryResult && creditEntryResult.ok) {
                    return true;
                } else {
                    return false;
                }
            }
        } catch(error) {
            return false;
        }        
    }
    
    async read(entity: IEntity, action: string): Promise<IEntity[]> {
        var entities: Array<IEntity> = [];
        var query:string = "";
        var data;

        try {
            if(action === "getBuyingPower") {
                    const portfolioId = entity.getFieldValue("portfolioId");
                    const assetId = entity.getFieldValue("entry").getFieldValue("assetId");

                    if(portfolioId === null) {
                        return entities;
                    }
                    
                    query = `
                        SELECT 
                            COALESCE(
                                SUM(CASE WHEN pte.side = 'debit' THEN pte.quantity * pte.price ELSE 0 END) -
                                SUM(CASE WHEN pte.side = 'credit' THEN pte.quantity * pte.price ELSE 0 END),
                                0
                            ) AS buyingPower
                        FROM 
                            PortfolioTransactionEntry AS pte
                        INNER JOIN 
                            PortfolioTransaction AS pt ON (pte.transactionId = pt.id)
                        WHERE 
                            pt.portfolioId = ? 
                            AND pte.assetId = ?  
                            AND pt.isCanceled = 0;`;

                    data = await window.database.SQLiteGet({ query: query, parameters: [portfolioId, assetId] });            
            } else if(action === "getPortfolioValue" || action === "getPortfolioValueByType" || action === "getPortfolioValueAll") {
                const portfolioId = entity.getFieldValue("portfolioId");

                if(portfolioId === null && action !== "getPortfolioValueAll") {
                    return entities;
                }

                var group = "a.id";
                if(action === "getPortfolioValueByType") {
                    group = "a.type";
                }

                var args = [portfolioId];
                var portfolioIdString = " AND pt.portfolioId=? ";
                if(action === "getPortfolioValueAll") {
                    portfolioIdString = " ";
                    args = [];
                }
                
                query = `
                    SELECT
                        a.symbol AS symbol,
                        a.name AS name,
                        a.type AS type,
                        a.id AS id,
                        SUM(CASE
                            WHEN pte.side = 'debit' THEN pte.quantity * pte.price
                            ELSE -pte.quantity * pte.price
                        END) AS assetValue,
                        SUM(CASE
                            WHEN pte.side = 'debit' THEN pte.quantity
                            ELSE -pte.quantity
                        END) AS quantity
                    FROM
                        PortfolioTransactionEntry AS pte
                    INNER JOIN
                        PortfolioTransaction AS pt ON (pte.transactionId = pt.id)
                    INNER JOIN
                        Asset AS a ON (pte.assetId = a.id)
                    WHERE
                        pt.isCanceled = 0
                        ${portfolioIdString}
                    GROUP BY
                        ${group};`;

                data = await window.database.SQLiteSelect({ query: query, parameters: args });
            }
        } catch(error) {
            return entities;
        } 

        if (action === "getBuyingPower" && data) {
            var entity = new Asset();
            entity.setFieldValue("buyingPower", data.buyingPower);            
            entities.push(entity);
        } else if((action === "getPortfolioValue" || action === "getPortfolioValueByType" || action === "getPortfolioValueAll") && data) {
            for(var row of data) {
                var entity = new Asset();
                entity.setFieldValue("id", row.id);
                entity.setFieldValue("name", row.name);
                entity.setFieldValue("symbol", row.symbol);
                entity.setFieldValue("type", row.type); 
                entity.setFieldValue("assetValue", row.assetValue);
                if(action === "getPortfolioValue" || action === "getPortfolioValueAll") {
                    entity.setFieldValue("quantity", row.quantity);
                }
                
                entities.push(entity);
            }
        }

        return entities;
    }

    private appendWhere(query:string, condition:string, hasWhereCondition:boolean, whereOperator:string = "OR") {
        if(!hasWhereCondition) {
            query += condition;
        } else {
            // currently using OR to match any of the conditions
            query += ` ${whereOperator}` + condition;
        }

        return query;
    }

    update(entity: IEntity, action: string): Promise<number> {
        throw new Error("This gateway does not have the ability to update content. Updates are handled by periodically deleting and re-entering data");
    }

    // purge the database of entries for a periodic refresh of the data
    async delete(entity: IEntity, action: string): Promise<number> {
        throw Error("This gateway does not have the ability to delete content.");
    }

    //check to see if the database table exists
    async checkTableExists() {
        const query = "SELECT name FROM sqlite_master WHERE type='table' AND name='PortfolioTransaction';"
        const args:any[]  = [];
        const rows = await window.electron.ipcRenderer.invoke('sqlite-query', { query: query, parameters: args });
        
        if(rows !== null && rows[0].name) {
            return true;
        }

        return false;
    }

    //for database tables that act as cache, check for the last time a table was updated
    async checkLastTableUpdate() {
        const query = "SELECT changedAt FROM modifications WHERE tableName='PortfolioTransaction' ORDER BY changedAt DESC LIMIT 1"
        const args:any[]  = [];
        const data = await window.electron.ipcRenderer.invoke('sqlite-get', { query: query, parameters: args });
        
        if(data && data.changedAt) {
            return new Date(data.changedAt);
        } else {
            return undefined;
        }
    }

    async refreshTableCache(entity: IEntity):Promise<Boolean> {
        return false;
    }
}