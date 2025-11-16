import {IEntity} from "@Entity/IEntity";
import {ISqlDataGateway} from "../ISqlDataGateway";
import { Portfolio } from "../../../Entity/Portfolio";

export class SQLitePortfolioGateway implements ISqlDataGateway {
    connection: any = null;
    sourceName: string = "SQLite Database";

    async connect(): Promise<void> {
        throw new Error("Due to the nature of this gateway's dependencies, connections are not handled through this method");
    }

    disconnect(): void {
        throw new Error("Due to the nature of this gateway's dependencies, connections and disconnections are not handled through this method");
    }

    // used to create and periodically refresh the cache
    async create(entity: IEntity): Promise<Boolean> {
        try {
            const query = "INSERT INTO Portfolio (name, userId, isDefault) VALUES (?, ?, ?)";
            const args  = [entity.getFieldValue("name"), entity.getFieldValue("userId"), entity.getFieldValue("isDefault")];
            const result = await window.database.SQLiteInsert({ query: query, parameters: args });
            
            if(result && result.ok) {
                return true;
            } 
            return result;
        } catch(error) {
            console.error('Portfolio creation error in gateway:', error);
            // Check for duplicate name error
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                throw new Error('A portfolio with this name already exists');
            }
            throw error;
        }
    }
    
    async read(entity: IEntity, action:string = "selectByUserId"): Promise<IEntity[]> {
        var query:string = "";
        var transactionQuery:string = "";
        var data;
        var transactionData;
        var entities: Array<IEntity> = [];

        try {
            const id = entity.getFieldValue("id");
            const name = entity.getFieldValue("name");
            const description = entity.getFieldValue("description");
            const userId = entity.getFieldValue("userId");
            const isDefault = entity.getFieldValue("isDefault");

            // an array to contain the parameters for the parameterized query
            const parameterArray:any[] = [];
            var hasWhereCondition:boolean = false;

            const transactionParameterArray:any[] = [];

            if(action==="selectByUserId") {
                query = "SELECT *";
                query += " FROM Portfolio WHERE";
                hasWhereCondition = false;
                query = this.appendWhere(query, " userId=?", hasWhereCondition, "AND");
                parameterArray.push(userId);
            } else if(action==="getPortfolioAssetGroups") {
                query = "SELECT *";
                query += " FROM Portfolio WHERE";
                hasWhereCondition = false;
                query = this.appendWhere(query, " id=?", hasWhereCondition, "AND");
                parameterArray.push(id);

                transactionQuery = `
                    SELECT
                        a.type AS assetType,
                        ROUND(SUM(
                            CASE e.side
                                WHEN 'debit' THEN e.amount
                                WHEN 'credit' THEN -e.amount
                                ELSE 0
                            END
                        ), 2) AS totalAmount
                    FROM
                        PortfolioTransactionEntry e
                    JOIN
                        Asset a ON e.assetId = a.id
                    JOIN
                        PortfolioTransaction t ON e.transactionId = t.id
                    WHERE
                        t.isCanceled = 0 AND
                        t.portfolioId = ?
                    GROUP BY
                        a.type;`
                transactionParameterArray.push(id);

                transactionData = await window.database.SQLiteQuery({query: transactionQuery, parameters: transactionParameterArray});
            }

            data = await window.database.SQLiteQuery({ query: query, parameters: parameterArray });
        } catch(error) {
            return entities;
        }

        for(var portfolio of data) {
            var entity = new Portfolio();
            entity.setFieldValue("id", portfolio.id);
            entity.setFieldValue("name", portfolio.name);
            entity.setFieldValue("description", portfolio.description);
            entity.setFieldValue("userId", portfolio.userId);
            entity.setFieldValue("isDefault", portfolio.isDefault);

            if(transactionData !== null && action==="getPortfolioAssetGroups") {
                entity.setFieldValue("assetGroupDetails", transactionData)
            }
            
            entities.push(entity);
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
        throw new Error("This gateway does not have the ability to delete content.");
    }

    //check to see if the database table exists
    async checkTableExists() {
        const query = "SELECT name FROM sqlite_master WHERE type='table' AND name='Portfolio';"
        const args:any[]  = [];
        const rows = await window.database.SQLiteQuery({ query: query, parameters: args });
        
        if(rows !== null && rows[0].name) {
            return true;
        }

        return false;
    }

    //for database tables that act as cache, check for the last time a table was updated
    async checkLastTableUpdate():Promise<any> {
        throw new Error("This gateway does not have the ability to check last table update.");
    }

    async refreshTableCache(entity: IEntity):Promise<Boolean> {
        throw new Error("This gateway does not have the ability to refresh table cache.");
        return false;
    }
}