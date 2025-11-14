[https://neo4j.com/docs/getting-started/appendix/tutorials/guide-import-relational-and-etl/](https://neo4j.com/docs/getting-started/appendix/tutorials/guide-import-relational-and-etl/)

Exporting data from a relational database and importing to a Neo4j \- a graph database

ERD \= Entity Relationship Diagram

Relational to Graph:

1. A row is a node  
   1. Each row in the table for a certain entity becomes a node with the properties of the entity  
2. A table name is a label name  
   1. The entity table name becomes the node label  
3. A join or foreign key is a relationship  
   1. Where there are joins between two entities, these become relationships between nodes.

Graph database eliminates use of “null” values \- they are just not present in the graph

Relationships are described in more detail \- using the actual verb rather than a **foreign key relationship**. 

**Normalization?** Graph can be changed, attributes can be added, etc. \- not rigid

First export the relational table to CSV

Then import the csv to the instance of Neo4j (?)

Use Cypher to transform data to a graph:

1. Load nodes from CSV files  
2. Create indexes and constraints for data in graph  
3. Create relationships between nodes

To create nodes for each entity, use a cypher block as shown in tutorial article

After creating the nodes, relationships must be created between them. 

To import relationships, must look up nodes that were just created  
Add a relationship between the existing entities  
To optimize node lookup, create indexes for node properties used in lookups  
Create constraint \- creates index \- disallow duplicates  
What is an index?

Do I need to have created a shell of the database in Neo4j before pulling the csv in?  
More broad info:

1. Understand the SQL database:

Relationships are stored indirectly by **matching keys** between tables  
What does SQL database look like? May contain tables for:

- Users  
- Modules  
- Concepts  
- Stocks  
- Portfolios  
- Etc.

These would serve as table headings \- join queries would be used between tables

2. Graph equivalent will contain the same data, but headings will be the node labels, and edges will be the relationships.  
- Neo4j stores relationships/edges as part of the data, so they can be traversed instantly

3. SQL can be run side-by-side with Neo4j. Data from SQL (is this just a snapshot?) first must be exported as a csv file.  
- Each table will be exported as a CSV file  
  - Users.csv  
  - Modules.csv  
  - Relationships.csv

  Each file will be either a node, or an edge


4. Next, define the graph model \- can be done visually, using excel, or in Neo4j

5. Import to Neo4j

Some more general info:

Not just a file import, but a data model transformation \- changing how the same data is represented.

Again, two main phases:

1. Design the Graph \- decide what are the nodes, edges, properties  
2. Load the data \- actually import and connect the records

Examine tables and relationships \- what do current relationships look like / are there any?

Design the graph schema / framework \- what the developer will then use to “script the import”

When preparing the SQL data for import, they should be saved as CSV files for each type of node, and each type of relationship. Data needs to be cleaned up, and “the columns should line up with the graph model” meaning the attributes for each entity should match the properties for the node on the graph.

Next, create the graph structure in Neo4j:

- Don’t need to pre-create tables, nodes and edges can be loaded in directly, then use Cypher to define the labels and relationships.  
- Cypher is Neo4j’s query language

