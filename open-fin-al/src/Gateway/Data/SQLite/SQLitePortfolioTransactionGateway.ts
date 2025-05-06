import { StockRequest } from "../../../Entity/StockRequest";
import {IEntity} from "../../../Entity/IEntity";
import {ISqlDataGateway} from "../ISqlDataGateway";

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
    async create(entity: IEntity, action: string): Promise<Boolean> {
        if(action==="deposit") {
            
        }

        throw Error("This gateway does not have the ability to create content.");
    }
    
    async read(entity: IEntity, action: string): Promise<IEntity[]> {
        var entities: Array<IEntity> = [];
        var query:string = "";
        var data;

        if(action === "getBuyingPower") {
            try {
                const portfolioId = entity.getFieldValue("portfolioId");

                if(portfolioId === null) {
                    return entities;
                }
                
                query = `SELECT * FROM PortfolioTransactionEntry AS pte 
                    INNER JOIN PortfolioTransaction AS pt ON (pte.transactionId = pt.id)
                    INNER JOIN Asset AS a ON (pte.assetId = a.id)
                    WHERE pt.portfolioId=?`;

                data = await window.database.SQLiteSelect({ query: query, parameters: [portfolioId] });

            } catch(error) {
                return entities;
            }
        } 

        if (action === "lookup") {
            entities = this.formatLookupResponse(data);
        } else if(action === "selectRandomSP500") {
            entities = this.formatRandomData(data);
        }

        return entities;
    }
    
    formatRandomData(data: any): any {
        var array: Array<IEntity> = [];

        for (const match of data) {           
            var entity = new StockRequest();
            
            entity.setFieldValue("ticker", match.ticker.toUpperCase());
            entity.setFieldValue("companyName", match.companyName);
            entity.setFieldValue("cik", match.cik);
            
            array.push(entity);
        }

        return array;
    }

    private formatLookupResponse(data:any) {
        var array: Array<IEntity> = [];

        for (const match of data) {           
            var entity = new StockRequest();
            
            entity.setFieldValue("ticker", match.ticker.toUpperCase());
            entity.setFieldValue("companyName", match.companyName);
            entity.setFieldValue("cik", match.cik);
            
            array.push(entity);
        }

        return array;
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
        try {
            const query = "DELETE FROM PublicCompany;";
            const args:any[]  = [];
            const result = await window.electron.ipcRenderer.invoke('sqlite-delete', { query: query, parameters: args });
            
            const query2 = "UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='PublicCompany'";
            await window.electron.ipcRenderer.invoke('sqlite-update', { query: query2, parameters: args });
            
            return result;
        } catch(error) {
            return 0;
        }
    }

    //check to see if the database table exists
    async checkTableExists() {
        const query = "SELECT name FROM sqlite_master WHERE type='table' AND name='PublicCompany';"
        const args:any[]  = [];
        const rows = await window.electron.ipcRenderer.invoke('sqlite-query', { query: query, parameters: args });
        
        if(rows !== null && rows[0].name) {
            return true;
        }

        return false;
    }

    //for database tables that act as cache, check for the last time a table was updated
    async checkLastTableUpdate() {
        const query = "SELECT changedAt FROM modifications WHERE tableName='PublicCompany' ORDER BY changedAt DESC LIMIT 1"
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