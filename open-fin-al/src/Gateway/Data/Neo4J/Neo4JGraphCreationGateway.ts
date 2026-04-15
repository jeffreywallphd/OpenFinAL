import neo4j, {Record, Node} from "neo4j-driver";
import { INeo4JGraphGateway } from "../INeo4JGraphGateway";
import { IEntity } from "@Entity/IEntity";

declare global {
    interface Window { 
        neo4j: any
    }
}

export class Neo4JGraphCreationGateway implements INeo4JGraphGateway {
    user: string = "";
    key: string = "";
    connection: any = null;
    sourceName: string = "Neo4j Local Database";

    async connect(): Promise<boolean> {
        try {
            return await window.neo4j.start();
        } catch (error) {
            console.error("Error connecting to Neo4j server:", error);
            return false;
        }
    }

    async disconnect(): Promise<boolean> {
        try {
            return await window.neo4j.stop();
        } catch (error) {
            console.error("Error disconnecting from Neo4j server:", error);
            return false;
        }
    }

    // used to create and periodically refresh the cache
    async create(): Promise<Boolean> {
        const schema: string[] = [
            `CREATE CONSTRAINT user_userId_unique IF NOT EXISTS
            FOR (u:User)
            REQUIRE u.userId IS UNIQUE`,

            `CREATE CONSTRAINT module_moduleId_unique IF NOT EXISTS
            FOR (m:Module)
            REQUIRE m.moduleId IS UNIQUE`,

            `CREATE CONSTRAINT concept_conceptId_unique IF NOT EXISTS
            FOR (c:Concept)
            REQUIRE c.conceptId IS UNIQUE`,

            `CREATE INDEX module_minLevel IF NOT EXISTS
            FOR (m:Module) ON (m.minLevel)`,

            `CREATE INDEX module_riskTag IF NOT EXISTS
            FOR (m:Module) ON (m.riskTag)`,
        ];

        const merges: string[] = [
            `MERGE (u1:User { userId: "u_alice" })
            SET u1.overallLevel = 2,
                u1.riskScore    = 2`,

            `MERGE (u2:User { userId: "u_bob" })
            SET u2.overallLevel = 1,
                u2.riskScore    = 1`,

            `MERGE (c_etf:Concept { conceptId: "c_etf", name: "ETFs" })`,
            `MERGE (c_div:Concept { conceptId: "c_div", name: "Dividends" })`,
            `MERGE (c_opt:Concept { conceptId: "c_opt", name: "Options" })`,
            `MERGE (c_cc:Concept  { conceptId: "c_cc",  name: "Covered Calls" })`,
            `MERGE (c_risk:Concept{ conceptId: "c_risk",name: "Risk Management" })`,

            `MERGE (m1:Module { moduleId: "m_etf_basics" })
            SET m1.title        = "ETF Basics",
                m1.description  = "Introduction to exchange-traded funds",
                m1.timeEstimate = 45,
                m1.minLevel     = 1,
                m1.riskTag      = 1`,

            `MERGE (m2:Module { moduleId: "m_div_income" })
            SET m2.title        = "Dividend Investing",
                m2.description  = "Building income with dividends",
                m2.timeEstimate = 60,
                m2.minLevel     = 2,
                m2.riskTag      = 1`,

            `MERGE (m3:Module { moduleId: "m_options_101" })
            SET m3.title        = "Options 101",
                m3.description  = "Foundations of options trading",
                m3.timeEstimate = 90,
                m3.minLevel     = 3,
                m3.riskTag      = 3`,

            `MERGE (m4:Module { moduleId: "m_covered_calls" })
            SET m4.title        = "Covered Call Strategies",
                m4.description  = "Generating income with covered calls",
                m4.timeEstimate = 75,
                m4.minLevel     = 3,
                m4.riskTag      = 2`,

            `MATCH (m1:Module {moduleId:"m_etf_basics"}),
                    (c_etf:Concept {conceptId:"c_etf"})
            MERGE (m1)-[:TEACHES {weight: 1.0}]->(c_etf)`,

            `MATCH (m2:Module {moduleId:"m_div_income"}),
                    (c_div:Concept {conceptId:"c_div"}),
                    (c_etf:Concept {conceptId:"c_etf"})
            MERGE (m2)-[:TEACHES {weight: 0.7}]->(c_div)
            MERGE (m2)-[:TEACHES {weight: 0.3}]->(c_etf)`,

            `MATCH (m3:Module {moduleId:"m_options_101"}),
                    (c_opt:Concept {conceptId:"c_opt"}),
                    (c_risk:Concept {conceptId:"c_risk"})
            MERGE (m3)-[:TEACHES {weight: 0.7}]->(c_opt)
            MERGE (m3)-[:TEACHES {weight: 0.3}]->(c_risk)`,

            `MATCH (m4:Module {moduleId:"m_covered_calls"}),
                    (c_cc:Concept {conceptId:"c_cc"}),
                    (c_opt:Concept {conceptId:"c_opt"})
            MERGE (m4)-[:TEACHES {weight: 0.6}]->(c_cc)
            MERGE (m4)-[:TEACHES {weight: 0.4}]->(c_opt)`,

            `MATCH (m2:Module {moduleId:"m_div_income"}),
                    (m1:Module {moduleId:"m_etf_basics"})
            MERGE (m2)-[:REQUIRES {strict:true}]->(m1)`,

            `MATCH (m3:Module {moduleId:"m_options_101"}),
                    (m1:Module {moduleId:"m_etf_basics"})
            MERGE (m3)-[:REQUIRES {strict:true}]->(m1)`,

            `MATCH (m4:Module {moduleId:"m_covered_calls"}),
                    (m3:Module {moduleId:"m_options_101"})
            MERGE (m4)-[:REQUIRES {strict:true}]->(m3)`,

            `MATCH (u:User {userId:"u_alice"}),
                    (c_etf:Concept {conceptId:"c_etf"}),
                    (c_div:Concept {conceptId:"c_div"})
            MERGE (u)-[:KNOWS {level:2, confidence:0.8, updatedAt:datetime()}]->(c_etf)
            MERGE (u)-[:KNOWS {level:1, confidence:0.6, updatedAt:datetime()}]->(c_div)`,

            `MATCH (u:User {userId:"u_bob"}),
                    (c_etf:Concept {conceptId:"c_etf"})
            MERGE (u)-[:KNOWS {level:1, confidence:0.5, updatedAt:datetime()}]->(c_etf)`,

            `MATCH (u:User {userId:"u_alice"}),
                    (m1:Module {moduleId:"m_etf_basics"})
            MERGE (u)-[:COMPLETED {at:datetime()}]->(m1)`,

            `MATCH (u:User {userId:"u_bob"}),
                    (m1:Module {moduleId:"m_etf_basics"})
            MERGE (u)-[:COMPLETED {at:datetime()}]->(m1)`,
        ];
        
        try {
            await window.neo4j.executeQuery("write", schema);
            await window.neo4j.executeQuery("write", merges);
            return true;
        } catch(error) {
            window.console.error("Error creating graph schema/data in Neo4j server:", error);
            return false;
        }
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
    async checkGraphExists(): Promise<Boolean> {
        try {
            const query = 
                `MATCH (n)
                RETURN count(n) AS count`
            ;

            const result = await window.neo4j.executeQuery("read", query);
            window.console.log(result);
            const count = result.records[0].count;
            window.console.log(count);
            if(count > 0) {
                return true;
            } else {
                return false;
            }
        } catch(error) {
            window.console.log(error);
            return false;
        }
    }

    async checkGraphConnected():Promise<Boolean> {
        try {
            const isConnected = await window.neo4j.isConnected();
            return isConnected;
        } catch(error) {
            return false;
        }
    }

    //for database tables that act as cache, check for the last time a table was updated
    async checkLastGraphUpdate():Promise<any> {
        throw new Error("This gatweay does not allow for checking tables. This gateway is designed for posting only.");
    }
}