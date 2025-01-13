# SBHacks XI - GauchoCourse  
# WINNER - Best Use of AI!

## Overview

**GauchoCourse** is an AI-powered chatbot designed to help UCSB students make personalized course selections. By analyzing academic transcripts, course data, RateMyProfessor reviews, and historical grade distributions, it provides tailored recommendations to guide students toward courses that best align with their learning preferences and academic strengths.

## Key Features

- **Personalized Recommendations**: Using course data, professor reviews, and grade distributions, GauchoCourse generates tailored course suggestions based on a student's academic profile.
- **Transcript Analysis**: The system processes transcripts to identify grade patterns, course sequences, and strengths to refine recommendations.
- **RAG Technology**: Combines data retrieval and AI generation to provide accurate and context-aware course advice in real-time.
- **Chat Interface**: A user-friendly interface allows students to interact with the AI assistant seamlessly.

## Tech Stack

- **Backend**: Python (FastAPI, data processing)
- **Frontend**: React, TailwindCSS, Next.js
- **Database**: Pinecone (vector database for similarity search)
- **Web Scraping**: Python scripts for gathering course data and reviews
- **Deployment**: Vercel

## How It Works

1. **Data Collection**: Our Python script scrapes and processes data from UCSB course catalogs, RateMyProfessor reviews, and historical grade distributions.
2. **Transcript Processing**: The system uses advanced chunking algorithms to analyze and identify meaningful patterns from student transcripts.
3. **Course Recommendations**: By combining academic data with RAG technology, GauchoCourse generates personalized course suggestions based on grade trends, teaching styles, and student preferences.
4. **Chatbot Interface**: Students interact with the system through a chat interface, receiving recommendations based on their academic history.

## Challenges Faced

- **Data Integration**: Ensuring consistency across diverse data sources like course catalogs, professor names, and grade distributions.
- **Transcript Analysis**: Developing effective chunking algorithms to extract meaningful insights from varied transcript formats.
- **RAG Implementation**: Tuning the retrieval system to balance context accuracy with natural conversational flow.

## Future Enhancements

- **Advanced Predictive Modeling**: Use historical data to better match students with professors whose teaching styles align with their learning preferences.
- **Study Group Matching**: Enable students to find study groups based on shared courses and academic strengths.

## Built With

- Python (FastAPI, Web Scraping)
- React, TailwindCSS, Next.js
- Pinecone (Vector Database)
- Vercel (Deployment)
- TypeScript, Node.js

## Learn More

For more details, explore the full project or reach out with any questions.
