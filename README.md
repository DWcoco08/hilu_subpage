# Subpage - Print-on-Demand Platform

Monorepo: React frontend + Supabase backend

## 📁 Structure

```
subpage/
├── subpage_be/
│   ├── BACKEND.md              ← Team Backend đọc
│   ├── DATABASE_SCHEMA.md      ← Database reference
│   └── supabase/
│       ├── functions/          ← Edge Functions (Deno)
│       └── migrations/         ← Database migrations
│
└── subpage_fe/
    ├── FRONTEND.md             ← Team Frontend đọc
    ├── src/lib/supabase.js     ← Supabase client
    └── src/services/           ← API services
```

## ✅ Completed

- ✅ Database (6 tables) - migrated to production
- ✅ Frontend Supabase client + services
- ✅ 1 Edge Function template (save-campaign-draft)

## 🎯 TODO

### Team Backend
**Đọc:** `subpage_be/BACKEND.md`

Implement 5 Edge Functions:
1. `GET /list-campaigns`
2. `GET /get-campaign`
3. `POST /launch-campaign`
4. `PUT /update-campaign`
5. `POST /upload-artwork`

### Team Frontend
**Đọc:** `subpage_fe/FRONTEND.md`

1. Authentication UI (login/signup)
2. Replace `alert()` bằng API calls
3. Loading states & error handling

## 🔗 Supabase

- **Project ID:** ewhabqbenhesnskznhut
- **URL:** https://ewhabqbenhesnskznhut.supabase.co
- **Dashboard:** https://app.supabase.com/project/ewhabqbenhesnskznhut

## 🚀 Quick Start

**Frontend:**
```bash
cd subpage_fe
npm install
npm run dev  # http://localhost:3000
```

**Backend (local testing - cần Docker):**
```bash
cd subpage_be
npx supabase start  # http://localhost:54323
npx supabase functions serve
```

## ⚠️ Notes

- Storage bucket chưa tạo được - backend dùng Cloudinary thay thế
- `.env` đã config - không commit vào Git
