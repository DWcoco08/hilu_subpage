# Subpage - Print-on-Demand Campaign Platform

A modern monorepo application for creating and managing print-on-demand campaigns.

## 🚀 Tech Stack

**Backend**: Deno (Supabase Edge Functions), PostgreSQL, Supabase Storage
**Frontend**: React 18, Vite 5, JavaScript, CSS

## 📁 Structure

```
subpage/
├── subpage_be/       # Backend - Supabase Edge Functions
└── subpage_fe/       # Frontend - React App
```

## ✨ Features

- Multi-step campaign wizard (4 steps)
- Artwork upload and management
- Product configuration
- Campaign publishing

## 🛠️ Getting Started

### Backend

```bash
cd subpage_be
npx supabase start
```

### Frontend

```bash
cd subpage_fe
npm install
npm run dev
```

## 📊 API Endpoints

- `POST /upload-artwork` - Upload files
- `POST /save-campaign-draft` - Save draft
- `POST /launch-campaign` - Publish campaign
- `GET /get-campaign` - Get details
- `GET /list-campaigns` - List all
- `PUT /update-campaign` - Update
