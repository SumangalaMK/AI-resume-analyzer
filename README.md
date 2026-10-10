# ResumeLens — AI Resume Analyzer (MERN)

A portfolio-ready full-stack application that compares a text-based PDF resume with a job description. It extracts supported skills, calculates a transparent keyword-coverage score, lists matched/missing skills, suggests improvements, and saves analysis history per user.

> **Important:** The starter analyzer is a deterministic dictionary-based text analyzer, not a trained AI model and not a hiring prediction. This keeps the first version runnable without paid AI keys. The service layer is isolated so an LLM or embedding-based matcher can be added later.

## Features

- User registration and sign-in (bcrypt password hashes, JWT authentication)
- PDF upload and text extraction (5 MB maximum; uploaded bytes are processed in memory, not stored as files)
- Resume-vs-job skill coverage score and matched/missing skill lists
- Practical resume suggestions
- MongoDB analysis history, view, and delete
- Per-user authorization, request validation, basic rate limiting, Helmet security headers
- Responsive React interface

## Requirements

- Node.js 20 or newer recommended
- npm
- MongoDB local instance or MongoDB Atlas connection string

## Run locally

1. Install Node.js and start MongoDB. For Atlas, create a database user and allow your development IP in Atlas Network Access.
2. Copy the root `.env.example` values into `server/.env` (or copy `server/.env.example` to `server/.env`). Set `MONGO_URI` and a long random `JWT_SECRET`. Do not commit `.env`.
3. Install dependencies from the project root:

   ```bash
   npm install
   npm run install:all
   ```

4. Start both apps in development mode:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:5173`. The API health check is `http://localhost:5000/api/health`.

If you prefer two terminals, run `npm run dev --prefix server` and `npm run dev --prefix client` separately.

### Environment variables (`server/.env`)

```env
MONGO_URI=mongodb://127.0.0.1:27017/resume_analyzer
JWT_SECRET=use-a-long-random-secret-here
PORT=5000
CLIENT_URL=http://localhost:5173
```

For a production frontend URL, change `CLIENT_URL`. If deploying the API separately, set `VITE_API_URL` in the frontend build environment to the API base URL ending in `/api`.

## How to use

1. Register with your name, email, and a password of at least 8 characters.
2. Upload a text-based PDF resume (scanned-image PDFs may not contain extractable text).
3. Enter the target role and paste a job description of at least 30 characters.
4. Select **Analyze my resume**. Review the percentage, matching skills, missing skills, and suggestions.
5. Open **Analysis history** to revisit or delete saved results.

## Project structure

```text
ai-resume-analyzer/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx             # auth, upload form, history, results UI
│       ├── api.js              # Axios API client and JWT header
│       ├── main.jsx
│       ├── styles.css
│       └── analyzer.test.js
├── server/
│   ├── src/
│   │   ├── app.js              # Express app, middleware, API routes
│   │   ├── server.js           # MongoDB connection and listener
│   │   ├── middleware/auth.js  # JWT verification
│   │   ├── models/             # User and Analysis Mongoose schemas
│   │   ├── routes/             # auth and analyses endpoints
│   │   └── services/           # analyzer and unit tests
│   └── .env.example
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## API endpoints

All endpoints are under `/api`. Analysis endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | API health check |
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Sign in and receive JWT |
| POST | `/analyses` | Multipart PDF + `jobDescription` + optional `roleTitle` |
| GET | `/analyses` | Current user's latest 50 analyses |
| GET | `/analyses/:id` | Read one owned analysis |
| DELETE | `/analyses/:id` | Delete one owned analysis |

Example `POST /api/analyses` multipart form fields: `resume` (PDF file), `jobDescription` (text, 30–20,000 chars), `roleTitle` (optional). Response contains an `analysis` object with `score`, `matchedSkills`, `missingSkills`, `resumeSkills`, `jobSkills`, and `suggestions`.

## Matching logic

1. Extract text from the PDF with `pdf-parse`.
2. Detect terms from a curated skill dictionary (case-insensitive with a few aliases).
3. Compare detected resume skills against job-description skills.
4. `score = round(matched job skills / all detected job skills × 100)`.
5. Generate rule-based suggestions and persist only the analysis summary, not the resume PDF or full extracted text.

This method can miss synonyms, infer no skill proficiency, and may be affected by keyword stuffing. A score of 80% means 80% of detected dictionary skills overlap; it does **not** mean an 80% chance of getting hired.

## Tests

```bash
npm test
```

The backend analyzer tests use Node's built-in test runner. The frontend includes a Vitest smoke test. Full API integration testing needs a test MongoDB instance and can be added with Supertest.

## Security and privacy notes

- Never commit `.env` or real resumes to Git.
- Uploaded PDF bytes are held in memory for parsing and are not saved as files by this app.
- Analysis summaries and original filenames are stored in MongoDB; don't use real personal data in public demos.
- For production, consider secure httpOnly cookie auth, stricter auth rate limits, token revocation, malware scanning, audit logs, retention controls, and a privacy policy.
- Do not use the score as the sole basis for hiring or other high-impact decisions.

## Suggested next upgrades

- Add a real AI provider (server-side API key only) for semantic matching and feedback grounded in resume text.
- Add OCR for scanned PDFs, with clear user consent.
- Add skill synonym mapping, section-aware parsing, PDF/DOCX support, and exportable reports.
- Add integration tests and CI with GitHub Actions.
- Deploy frontend and API separately and use MongoDB Atlas.

## Resume bullet example

Use only after you have run and understood the project; adapt to your actual work:

> Built a MERN-stack resume analysis web app with JWT authentication, PDF text extraction, MongoDB-backed analysis history, and rule-based resume-to-job skill matching with actionable feedback.
