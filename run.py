#!/usr/bin/env python3
"""
CLI Runner for the AI-Powered College ERP Multi-Agent System.
Starts the FastAPI backend and provides quick health diagnostic checks.
"""
import sys
import uvicorn
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from backend.config import settings

def main():
    print("=" * 70)
    print("🚀 LAUNCHING AI-POWERED COLLEGE ERP MULTI-AGENT ASSISTANT")
    print("=" * 70)
    print(f"• LLM Model       : {settings.OLLAMA_MODEL} ({settings.OLLAMA_BASE_URL})")
    print(f"• Vector Store    : Pinecone ({settings.PINECONE_INDEX_NAME})")
    print(f"• Review Agent    : {'Enabled (5-Point Audit)' if settings.ENABLE_REVIEW_AGENT else 'Disabled'}")
    print(f"• API Server      : http://{settings.API_HOST}:{settings.API_PORT}")
    print(f"• API Docs (Swagger): http://{settings.API_HOST}:{settings.API_PORT}/docs")
    print("=" * 70)

    uvicorn.run(
        "backend.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )

if __name__ == "__main__":
    main()
