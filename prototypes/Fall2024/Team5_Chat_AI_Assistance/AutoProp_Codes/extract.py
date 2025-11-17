import spacy
from datetime import datetime, timedelta
import dateparser

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")

def extract_dates(query):
    # Parse the query using spaCy
    doc = nlp(query)
    
    # Attempt to find dates using spaCy's NER
    for ent in doc.ents:
        if ent.label_ == "DATE":
            return dateparser.parse(ent.text)  # Use dateparser for parsing

    # Fallback: if no date is found, try using dateparser on the whole query
    parsed_date = dateparser.parse(query)
    return parsed_date

# Example usage
# user_query = "What was the stock price of google last week?"
# user_query="What was the price of AMD stock two months ago?"
# user_query="what was the price of PayPal stock two years back?" # not working
# user_query = "what was the google price yesterday"
# user_query = "what was the google price on 21st sept 2023"
# user_query="what was the price of apple last year"
# user_query="What was the price of AMD stock two years ago?"
# user_query="what was the price of apple 3 days before?"
# extracted_date = extract_dates(user_query)
# print(f"Extracted date: {extracted_date.strftime('%Y-%m-%d') if extracted_date else 'No date found'}")
