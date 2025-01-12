from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import anthropic
import pinecone
import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

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

if __name__ == '__main__':
    print("Starting Flask server...")
    try:
        app.run(debug=True, host='localhost', port=8000)
        print("Server started successfully!")
    except Exception as e:
        logger.error(f"Error starting server: {str(e)}")