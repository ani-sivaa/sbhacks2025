from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import anthropic
import pinecone
import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import logging
import signal
import sys
from aryn_sdk.partition import partition_file, tables_to_pandas
import pdf2image
import re
from io import BytesIO
from typing import List, Dict
import pandas as pd
import numpy as np

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],  # Your Next.js frontend port
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Load API keys from .env
load_dotenv()

# Initialize Pinecone and Claude API keys
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = "us-east-1"
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Check if API keys are present
if not PINECONE_API_KEY or not ANTHROPIC_API_KEY:
    logger.error("Missing required API keys. Please check your .env file.")
    raise ValueError("Missing required API keys")

try:
    # Initialize Pinecone client
    pinecone_client = pinecone.Pinecone(
        api_key=PINECONE_API_KEY,
        serverless_spec=pinecone.ServerlessSpec(
            cloud="aws",
            region=PINECONE_ENVIRONMENT
        )
    )

    # Connect to your Pinecone index
    index_name = "aryn"
    index = pinecone_client.Index(index_name)

    # Initialize Claude client
    anthropic_client = anthropic.Client(api_key=ANTHROPIC_API_KEY)

    # Initialize SentenceTransformer model globally
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
except Exception as e:
    logger.error(f"Error during initialization: {str(e)}")
    raise

def query_pinecone(query: str, namespace: str = None, top_k: int = 3):
    """
    Query the Pinecone vector database for the most relevant matches.
    """
    try:
        query_embedding = model.encode(query, convert_to_tensor=False).tolist()
        response = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            namespace=namespace,
        )
        return response.matches
    except Exception as e:
        logger.error(f"Error querying Pinecone: {str(e)}")
        raise

def generate_claude_response(query: str, context: str):
    """
    Send a query and context to Claude to generate a chatbot response.
    """
    try:
        response = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            temperature=0.7,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Given this context: {context}\n\nAnswer this question: {query}"
                        }
                    ]
                }
            ]
        )
        return response.content[0].text
    except Exception as e:
        logger.error(f"Error generating Claude response: {str(e)}")
        raise

def chatbot(query: str):
    """
    Main chatbot logic combining Pinecone querying and Claude response generation.
    """
    try:
        print("\n=== Chatbot Function ===")
        print("🔍 Querying Pinecone for:", query)
        matches = query_pinecone(query)
        
        if not matches:
            print("⚠️ No matches found in Pinecone")
            return "I couldn't find any relevant information for your query."

        print(f"✅ Found {len(matches)} matches in Pinecone")
        
        # Format the metadata into a readable context
        context = "\n".join([
            f"Course: {match['metadata']['course']}, "
            f"Instructor: {match['metadata']['instructor']}, "
            f"Department: {match['metadata']['dept']}, "
            f"Term: {match['metadata']['quarter']} {match['metadata']['year']}, "
            f"Average GPA: {match['metadata']['avgGPA']}, "
            f"Number of Students: {match['metadata']['nLetterStudents']}"
            for match in matches
        ])
        
        print("📝 Formatted context:", context)
        print("🤖 Generating Claude response...")
        
        response = generate_claude_response(query, context)
        print("✅ Claude response received:", response)
        
        return response
    except Exception as e:
        print("❌ Error in chatbot function:", str(e))
        logger.error(f"Error in chatbot function: {str(e)}", exc_info=True)
        raise

@app.route('/')
def home():
    try:
        return render_template('chatdemo.html')
    except Exception as e:
        logger.error(f"Error rendering template: {str(e)}")
        return "Error loading the chat interface", 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        print("\n=== New Chat Request ===")
        print("📨 Headers:", dict(request.headers))
        print("📦 Raw data:", request.get_data().decode('utf-8'))
        
        data = request.json
        print("🔍 Parsed JSON data:", data)
        
        if not data or 'query' not in data:
            error_message = 'Query is required'
            print("❌ Error:", error_message)
            return jsonify({'error': error_message}), 400

        query = data['query']
        print("💭 Processing query:", query)
        
        print("🤖 Calling chatbot function...")
        response = chatbot(query)
        print("✅ Generated response:", response)
        
        return jsonify({'response': response})

    except Exception as e:
        error_message = f"Error processing chat request: {str(e)}"
        print("❌ Exception occurred:")
        print(f"❌ Error type: {type(e).__name__}")
        print(f"❌ Error message: {str(e)}")
        print(f"❌ Stack trace:", exc_info=True)
        logger.error(error_message, exc_info=True)
        return jsonify({'error': error_message}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

def signal_handler(sig, frame):
    print('\nGracefully shutting down server...')
    sys.exit(0)

# Add the departments set and course pattern
# List of department codes
departments = {'ED', 'CMPSC', 'RUSS', 'CNCSP', 'PSY', 'DYNS', 'EARTH', 
               'BL', 'TMP', 'ESM', 'ITAL', 'CHIN', 'DANCE', 'MATH', 'GLOBL', 
               'KOR', 'LATIN', 'RG', 'EDS', 'ENGL', 'ECON', 'PSTAT', 'HEB', 
               'PORT', 'EEMB', 'CHEM', 'FEMST', 'WRIT', 'EACS', 'ENV', 'CMPSCW', 
               'GER', 'W&L', 'PHYS', 'GRAD', 'BIOL', 'BMSE', 'AS', 'MARSC', 'LAIS', 
               'MUS', 'CH', 'ANTH', 'COMM', 'SLAV', 'GREEK', 'C', 'FAMST', 'MAT', 
               'JAPAN', 'MS', 'SPAN', 'INT', 'ES', 'ASTRO', 'ART', 'CLASS', 'MATRL', 
               'ECE', 'SOC', 'HIST', 'ENGR', 'THTR', 'LING', 'ME', 'BIOE', 'ESS', 
               'FR', 'GEOG', 'POL', 'PHIL', 'MCDB', 'ARTHI'}
              # ... rest of departments ...}
course_pattern = rf'\b(?:{"|".join(departments)})\s\d{{1,3}}[A-Z]?\b'

def parse_prerequisites(prereq_string: str, completed_courses: List[str]) -> bool:
    if pd.isna(prereq_string) or prereq_string.lower() == 'none':
        return True
        
    # Convert completed courses to embeddings
    completed_embeddings = model.encode([c.strip() for c in completed_courses])
    prereq_embedding = model.encode(prereq_string)
    
    # Calculate similarity scores
    similarities = np.dot(completed_embeddings, prereq_embedding.T)
    
    # Check if any completed course is similar enough to satisfy prereq
    return np.max(similarities) > 0.7  # Threshold can be adjusted

def get_available_courses(completed_courses: List[str], courses_df: pd.DataFrame) -> List[Dict]:
    available_courses = []
    
    for _, course in courses_df.iterrows():
        # Skip if already completed
        if course['course'] in completed_courses:
            continue
            
        # Check prerequisites
        if parse_prerequisites(course['prereqs'], completed_courses):
            available_courses.append({
                'code': course['course'],
                'title': course['coursetitle'],
                'prereqs': course['prereqs'],
                'description': course['description'],
                'units': course['units']
            })
    
    return available_courses

# Add new route for transcript upload
@app.route('/api/upload-transcript', methods=['POST'])
def upload_transcript():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
            
        file = request.files['file']
        if file.filename == '' or not file.filename.endswith('.pdf'):
            return jsonify({'error': 'Invalid file'}), 400

        # Process PDF
        file_stream = BytesIO(file.read())
        partitioned_file = partition_file(
            file_stream, 
            os.getenv("ARYN_API_KEY"),
            extract_table_structure=True, 
            threshold=0.1
        )

        # Extract tables and courses
        pandas_tables = tables_to_pandas(partitioned_file)
        all_courses = []
        
        for elt, dataframe in pandas_tables:
            if elt['type'] == 'table':
                table_text = dataframe.to_string(index=False, header=False)
                courses = re.findall(course_pattern, table_text)
                all_courses.extend(courses)

        unique_courses = sorted(set(all_courses))
        
        # Load courses data
        courses_df = pd.read_csv('public/merged_courses.csv')
        
        # Get available courses
        available_courses = get_available_courses(unique_courses, courses_df)
        
        # Sort by relevance (you could add more sophisticated sorting here)
        available_courses.sort(key=lambda x: x['units'], reverse=True)
        
        return jsonify({
            'success': True,
            'completed_courses': unique_courses,
            'available_courses': available_courses[:10]  # Return top 10 suggestions
        })

    except Exception as e:
        logger.error(f"Error processing transcript: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask server...")
    try:
        # Register signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        app.run(debug=True, host='localhost', port=8000)
    except Exception as e:
        logger.error(f"Error starting server: {str(e)}")
        sys.exit(1)