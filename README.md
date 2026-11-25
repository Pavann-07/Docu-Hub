# DocuHub

A multilingual document reader built for **Smart India Hackathon 2025 (PS SIH25080)**.

DocuHub helps people make sense of long circulars, contracts, meeting notes, and scanned notices in English and Malayalam. Upload a file, and DocuHub reads it, pulls out important dates, connects it to related documents, and lets you ask questions in plain English or Malayalam showing the exact lines where each answer came from.

## What It Does

- **Reads many file types:** Works with PDFs, Word files, text files, and scanned images.
- **Speaks English and Malayalam:** Automatically detects Malayalam documents, translates them for search, and lets you ask and get answers in your own language.
- **Finds deadlines for you:** Pulls out dates (due dates, meetings, payments, expiries) and puts them on a calendar you can export.
- **Links related files:** Groups and connects documents that talk about the same department, scheme, or people in a visual graph.
- **Answers with proof:** Every AI answer shows the source passages it used and every step it took to find them.

## Tech Stack

- **Frontend:** React + Vite - clean web app and document reader interface (with Nginx serving it in Docker).
- **Backend API:** FastAPI (Python) - handles logins, file uploads, background processing, and search endpoints.
- **Database:** MongoDB (Beanie) - stores users, document details, tags, dates, graph links, and past questions. *(Falls back to an in-memory database if MongoDB isn't running.)*
- **Vector Search:** ChromaDB - stores document chunks as embeddings (`all-MiniLM-L6-v2`) so search matches by meaning, not just exact words.
- **LLM & Language:** Google Gemini (`google-genai`) - writes summaries, tags, date labels, and Q&A answers. *(Falls back to spaCy rules and sentence matching when no API key is set.)*
- **OCR (Scanned Files):** Tesseract (English + Malayalam) - reads text out of scanned notices and images.
- **Cache & Rate Limit:** Redis - caches search results for speed and limits repeated API requests.
- **Containers:** Docker + Docker Compose - runs MongoDB, Redis, the backend API, and the web frontend together.
