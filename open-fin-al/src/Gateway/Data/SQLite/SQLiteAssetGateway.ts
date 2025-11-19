import { StockRequest } from "../../../Entity/StockRequest";
import {IEntity} from "../../../Entity/IEntity";
import {ISqlDataGateway} from "../ISqlDataGateway";
import { parse } from 'node-html-parser';
import { APIEndpoint } from "../../../Entity/APIEndpoint";
import { JSONRequest } from "../../Request/JSONRequest";
import { Asset } from "../../../Entity/Asset";

declare global {
    interface Window {
        database: any,
        exApi: any
    }
}

export class SQLiteAssetGateway implements ISqlDataGateway {
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
        try {
            const query = "INSERT INTO Asset (type, symbol, cik) VALUES (?, ?, ?)";
            const args  = [entity.getFieldValue("type"), entity.getFieldValue("symbol"), entity.getFieldValue("cik")];
            const result = await window.database.SQLiteGet({ query: query, parameters: args });
            return true;
        } catch(error) {
            return false;
        }
    }

    async read(entity: IEntity, action: string): Promise<IEntity[]> {
        var query:string = "";
        var data;

        if(action === "lookup") {
            try {
                const keyword = entity.getFieldValue("keyword");
                const companyName = entity.getFieldValue("companyName");
                const ticker = entity.getFieldValue("ticker");
                const cik = entity.getFieldValue("cik");
                const isSP500 = entity.getFieldValue("isSP500");

                if(keyword === null && companyName === null && ticker === null && cik === null) {
                    return [];
                }

                query = "SELECT *";

                // an array to contain the parameters for the parameterized query
                const parameterArray:any[] = [];

                // create a preference for ticker matches over companyName matches
                if(keyword !== null) {
                    query += ", CASE WHEN symbol LIKE ? || '%' THEN 1 WHEN name LIKE ? || '%' THEN 2 ELSE 3 END AS rank";
                    parameterArray.push(keyword);
                    parameterArray.push(keyword);
                }

                query += " FROM Asset WHERE";

                var hasWhereCondition:boolean = false;

                query = this.appendWhere(query, " type='Stock'", hasWhereCondition);
                hasWhereCondition = true;

                if(keyword !== null) {
                    // treat the keyword as a CIK if able to parseFloat()
                    if(!isNaN(parseFloat(keyword))) {
                        query = this.appendWhere(query, " cik=?", hasWhereCondition);
                        parameterArray.push(keyword);
                    } else {
                        query = this.appendWhere(query, " symbol LIKE ? || '%' OR name LIKE ? || '%'", hasWhereCondition);

                        // Push twice to check in ticker and companyName
                        // TODO: create a text index with ticker and companyName data
                        parameterArray.push(keyword);
                        parameterArray.push(keyword);
                    }
                }

                if(companyName !== null) {
                    query = this.appendWhere(query, " name LIKE '%' || ? || '%'", hasWhereCondition);
                    parameterArray.push(companyName);
                }

                if(ticker !== null) {
                    query = this.appendWhere(query, " symbol LIKE '%' || ? || '%'", hasWhereCondition);
                    parameterArray.push(ticker);
                }

                if(cik !== null) {
                    query = this.appendWhere(query, " cik LIKE '%' || ? || '%'", hasWhereCondition);
                    parameterArray.push(cik);
                }

                if(isSP500 !== null) {
                    query = this.appendWhere(query, " isSP500=?", hasWhereCondition, "AND");
                    parameterArray.push(isSP500);
                }

                if(keyword !== null) {
                    query += " ORDER BY rank ASC, symbol ASC LIMIT 10";
                } else {
                    query += " ORDER BY symbol ASC LIMIT 10";
                }

                data = await window.database.SQLiteQuery({ query: query, parameters: parameterArray });
            } catch(error) {
                return [];
            }
        } else if(action === "selectRandomSP500") {
            query = "SELECT * FROM Asset WHERE isSP500 = 1 AND type = 'Stock' ORDER BY RANDOM() LIMIT 1;";
            data = await window.database.SQLiteQuery({ query: query });
        } else if(action === "getCashId") {
            query = "SELECT id FROM Asset WHERE symbol='Cash' AND type='Cash';"
            data = await window.database.SQLiteQuery({ query: query });
        }

        var entities: Array<IEntity> = [];
        if (action === "lookup" || action === "selectRandomSP500") {
            entities = this.formatLookupResponse(data);
        } else if(action === "getCashId") {
            entity.setFieldValue("id", data[0].id);
            entities.push(entity);
        }

        return entities;
    }

    private formatRandomData(data: any): any {
        var array: Array<IEntity> = [];

        for (const match of data) {
            var entity = new StockRequest();

            entity.setFieldValue("ticker", match.symbol.toUpperCase());
            entity.setFieldValue("companyName", match.name);
            entity.setFieldValue("cik", match.cik);

            array.push(entity);
        }

        return array;
    }

    private formatLookupResponse(data:any) {
        var array: Array<IEntity> = [];

        for (const match of data) {
            var entity = new Asset();

            entity.setFieldValue("id", match.id);
            entity.setFieldValue("symbol", match.symbol.toUpperCase());
            entity.setFieldValue("name", match.name);
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
            const query = "DELETE FROM Asset;";
            const args:any[]  = [];
            const result = await window.database.SQLiteDelete({ query: query, parameters: args });

            const query2 = "UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='Asset'";
            await window.database.SQLiteUpdate({ query: query2, parameters: args });

            return result;
        } catch(error) {
            return 0;
        }
    }

    //check to see if the database table exists
    async checkTableExists() {
        try {
            const query = "SELECT name FROM sqlite_master WHERE type='table' AND name='Asset';"
            const args:any[]  = [];
            const rows = await window.database.SQLiteQuery({ query: query, parameters: args });

            if(rows !== null && rows[0].name) {
                return true;
            }

            return false;
        } catch(error) {
            return false;
        }
    }

    //for database tables that act as cache, check for the last time a table was updated
    async checkLastTableUpdate() {
        const query = "SELECT changedAt FROM modifications WHERE tableName='Asset' ORDER BY changedAt DESC LIMIT 1"
        const args:any[]  = [];
        const data = await window.database.SQLiteGet({ query: query, parameters: args });

        if(data && data.changedAt) {
            return new Date(data.changedAt);
        } else {
            return undefined;
        }
    }

    async refreshTableCache(entity: IEntity):Promise<Boolean> {
        //Update stock assets based on SEC listings
        try {
            const userEmail = await window.vault.getSecret("Email");

            var endpointRequest = new JSONRequest(JSON.stringify({
                request: {
                    endpoint: {
                        method: "GET",
                        protocol: "https",
                        hostname: "www.sec.gov",
                        pathname: "files/company_tickers.json",
                        headers: {
                            "User-Agent": `Investor ${userEmail}`
                        },
                    }
                }
            }));

            var endpoint = new APIEndpoint();
            endpoint.fillWithRequest(endpointRequest);

            //pass custom user-agent header through url query to avoid it being overriden
            const secData = await window.exApi.fetch(`https://www.sec.gov/files/company_tickers.json`, endpoint.toObject());

            // Parse the SEC JSON file to extract ticker, CIK, and companyName
            for(var key in secData) {
                var ticker = secData[key]["ticker"];
                var cik = secData[key]["cik_str"];
                var companyName = secData[key]["title"].toUpperCase();

                if(cik.toString().length < 10) {
                    const diff = 10 - cik.toString().length;
                    var newCik = "";

                    for(var i=0; i < diff; i++) {
                        newCik += "0";
                    }

                    cik = newCik + cik;
                }

                try {
                    const query = "INSERT OR IGNORE INTO Asset (name, symbol, cik, type) VALUES(?,?,?,'Stock')";
                    const args  = [companyName, ticker, cik];
                    await window.database.SQLiteInsert({ query: query, parameters: args });
                } catch(error) {
                    continue;
                }
            }

            //update the S&P500 status of stock assets
            endpointRequest = new JSONRequest(JSON.stringify({
                request: {
                    endpoint: {
                        method: "GET",
                        protocol: "https",
                        hostname: "en.wikipedia.org",
                        pathname: "wiki/List_of_S%26P_500_companies",
                        headers: {
                            "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36`
                        },
                    }
                }
            }));

            endpoint = new APIEndpoint();
            endpoint.fillWithRequest(endpointRequest);

            // get the S&P 500 companies and store those in a database
            const SP500Response = await window.exApi.fetch("https://en.wikipedia.org/wiki/List_of_S%26P_500_companies", endpoint.toObject());
            const SP500Object = parse(SP500Response);

            // get all of the rows from the consituents table that stores the S&P500 companies
            const rows = SP500Object.querySelector("#constituents")?.querySelectorAll("tr");

            // loop over all rows in the constituents table to extract S&P500 tickers
            if (rows) {
                //start by setting S&P500 to 0 for all stocks to reset
                try {
                    const query = "UPDATE Asset SET isSP500=0";
                    await window.database.SQLiteUpdate({ query: query, parameters: [] });
                } catch(error) {
                    //do nothing
                }

                for(var row of rows) {
                    var tds = Array.from(row.querySelectorAll("td"));

                    // for valid rows in the table, get the ticker from the first cell and update the database
                    if(tds.length > 0) {
                        var SP500ticker = tds[0].querySelector("a").innerText;
                        const updateQuery = "UPDATE Asset SET isSP500=1 WHERE symbol=? AND type='Stock'";
                        const updateArgs = [SP500ticker];
                        await window.database.SQLiteUpdate({ query: updateQuery, parameters: updateArgs });
                    }
                }
            }

            return true;
        } catch(error) {
            return false;
        }
    }

    async count() {
        const query = "SELECT COUNT(*) AS count FROM Asset WHERE type='Stock';";
        const data = await window.database.SQLiteQuery({ query: query });
        if(data) {
            return data[0];
        }
        return data;
    }
}
