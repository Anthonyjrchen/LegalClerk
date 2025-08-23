# LegalClerk

A full-stack legal dashboard app with Microsoft Graph calendar integration, built with React (Vite), FastAPI, Supabase, and Tailwind.

## Prerequisites

- Node.js (v18+ recommended)
- Python (v3.10+ recommended)
- Supabase account & project
- Microsoft Azure app registration (for Graph API)

## Getting Started

### 1. Clone the repository

```sh
git clone <your-repo-url>
cd LegalClerk
```

### 2. Configure environment variables

- Copy `.env.local.example` to `.env.local` in `frontend/` and fill in:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- In `backend/`, create a `.env` file with:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `MS_CLIENT_ID`
  - `MS_CLIENT_SECRET`

### 3. Install dependencies

#### Frontend

```sh
cd frontend
npm install
```

#### Backend

```sh
cd ../backend
python -m venv venv
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned # if you see a "running scripts is disabled error"
venv/Scripts/activate
pip install -r requirements.txt
```

### 4. Run the app

#### Backend (FastAPI)

```sh
uvicorn backend.main:app --reload --port 8080
```

#### Frontend (Vite)

```sh
cd ../frontend
npm run dev
```

### 5. Usage

- Sign up and log in.
- Connect your Microsoft account from the Profile page.
- Create templates, schedule trials, and sync events to your Outlook calendar.

## Folder Structure

- `frontend/` — React app (Vite, Tailwind, shadcn/ui, Supabase client)
- `backend/` — FastAPI app (Supabase Python client, Microsoft Graph integration)

## Troubleshooting

- Ensure all environment variables are set correctly.
- Check Supabase RLS policies if you get permission errors.
- For Microsoft Graph issues, verify your Azure app registration and redirect URI.

## License

MIT
