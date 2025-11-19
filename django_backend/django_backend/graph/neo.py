from neo4j import GraphDatabase
from dotenv import load_dotenv
import os

# Load .env into environment
load_dotenv()

URI = os.getenv("NEO4J_URI")                     # e.g. neo4j+s://404db15c.databases.neo4j.io:7687
USER = os.getenv("NEO4J_USER", "neo4j")
PWD  = os.getenv("NEO4J_PASS")               # <- must match .env key

print("NEO4J_URI =", URI)
print("NEO4J_USER =", USER)

driver = GraphDatabase.driver(URI, auth=(USER, PWD))
# Optional: run at import to fail fast with a clear message
try:
    driver.verify_connectivity()
except Exception as e:
    raise RuntimeError(f"Neo4j connection failed: {e}")

def get_session():
    """Utility to get a Neo4j session"""
    return driver.session()

def close_driver():
    """Close driver on shutdown"""
    driver.close()
