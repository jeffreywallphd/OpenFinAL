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
            const query = "INSERT INTO Portfolio (name, description, userId, isDefault) VALUES (?, ?, ?, ?)";
            const args  = [entity.getFieldValue("name"), entity.getFieldValue("description"), entity.getFieldValue("userId"), entity.getFieldValue("isDefault")];
            const result = await window.database.SQLiteInsert({ query: query, parameters: args });
            return result;
        } catch(error) {
            return false;
        }
    }
    
    async read(entity: IEntity): Promise<IEntity[]> {
        var query:string = "";
        var data;
        var entities: Array<IEntity> = [];

        try {
            const name = entity.getFieldValue("name");
            const description = entity.getFieldValue("description");
            const userId = entity.getFieldValue("userId");
            const isDefault = entity.getFieldValue("isDefault");

            if(name === null || userId === null) {
                return entities;
            }
            
            query = "SELECT *";

            // an array to contain the parameters for the parameterized query
            const parameterArray:any[] = [];

            query += " FROM Portfolio WHERE";

            var hasWhereCondition:boolean = false;

            query = this.appendWhere(query, " userId=?", hasWhereCondition, "AND");
            parameterArray.push(userId);
            
            data = await window.database.SQLiteQuery({ query: query, parameters: parameterArray });      
        } catch(error) {
            return entities;
        }

        for(var portfolio of data) {
            var entity = new Portfolio();
            entity.setFieldValue("name", portfolio.name);
            entity.setFieldValue("description", portfolio.description);
            entity.setFieldValue("userId", portfolio.userId);
            entity.setFieldValue("isDefault", portfolio.isDefault);
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