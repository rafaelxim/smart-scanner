# Smart Expense Scanner

## Product Idea

Smart Expense Scanner is a mobile app that lets users photograph invoices, receipts, or payment proofs and automatically classifies the expense type.

## How It Works

1. The user takes a photo of a receipt.
2. The app sends the image to the backend.
3. The backend runs OCR and extracts basic information from the image.
4. A TensorFlow-based model classifies the expense into one of these categories:
   - Food
   - Transport
   - Health
   - Education
   - Home
   - Business
5. The app then shows a simple history screen with basic charts.

## Architecture Decisions

### Monorepo

- Use a single monorepo.
- Use `pnpm` workspaces.
- Keep shared code in a dedicated package for API types and domain models only.

### Mobile App

- Use React Native with Expo Managed Workflow.
- Use TypeScript.
- Support both camera capture and gallery upload.
- Focus Day 1 on the upload flow first.

### Backend

- Use Fastify with TypeScript.
- Accept uploads through a single combined `multipart/form-data` endpoint.
- Store receipt data in a single `receipt` table.
- Include extracted text fields in the schema.
- Save uploaded image files on disk.
- Keep OCR in the backend.
- Use Tesseract.js for OCR.
- Accept OCR failures gracefully and still save the receipt record.
- Expose a health check endpoint.

### Data and Infra

- Use SQLite for persistence.
- Keep SQLite in the backend container filesystem with a Docker volume for durability.
- Mount an `uploads/` volume for image persistence.
- Use Docker and Docker Compose for local development and demo deployment.
- Include a basic CI workflow that runs install and typecheck.

### Day 1 Scope

- Set up the mobile app, backend, and Docker.
- Implement the real upload plumbing.
- Persist uploaded receipts with placeholder classification data.
- Verify OCR runs in the backend.
- Keep the flow local-only with no authentication.

## Why It Impresses Recruiters

This project demonstrates:

- Mobile development
- Backend integration
- Docker and containerized workflows
- Image upload handling
- AI-based classification
- OCR extraction
- Data organization
- Practical UX

## 1-Week Scope

- Day 1: Mobile and backend setup, plus Docker
- Day 2: Image upload flow
- Day 3: History screen and manual entry form
- Day 4: Simple classification model with TensorFlow.js
- Day 5: App to backend to ML integration
- Day 6: UI polish, loading states, and error states
- Day 7: README, screenshots, demo video, and local deployment via Docker
