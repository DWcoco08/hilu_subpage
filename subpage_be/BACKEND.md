# Backend - Subpage Campaign Platform

Hướng dẫn cho team backend implement Edge Functions.

## 📁 Structure

```
subpage_be/
└── supabase/
    ├── functions/
    │   ├── _shared/
    │   │   └── cors.ts              # ✅ CORS config
    │   └── save-campaign-draft/     # ✅ Template example
    │       └── index.ts
    └── migrations/
        └── 20250108000000_initial_schema.sql
```

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (bắt buộc)
- Deno (tự động cài bởi Supabase CLI)

### Start Local Environment

```bash
cd subpage_be

# Start Supabase (lần đầu sẽ download Docker images)
npx supabase start

# Output:
# - API URL: http://localhost:54321
# - Studio URL: http://localhost:54323
# - anon key: eyJ...
# - service_role key: eyJ...
```

### Serve Functions

```bash
# Serve all functions
npx supabase functions serve

# Hoặc serve 1 function
npx supabase functions serve save-campaign-draft
```

### Test Function

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/save-campaign-draft' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "title": "Test Campaign",
    "creatorName": "John Doe"
  }'
```

## 📝 TODO - 5 Edge Functions

### Template Có Sẵn

**File:** `functions/save-campaign-draft/index.ts`

Dùng làm reference cho các functions khác. Pattern:
- ✅ CORS handling
- ✅ Auth verification
- ✅ Input validation
- ✅ Database operations
- ✅ Error handling

---

### 1. ⏳ list-campaigns

**Endpoint:** `GET /list-campaigns?status=draft&limit=10&offset=0`

**Query Params:**
- `status` (optional): 'draft' | 'active' | 'completed' | 'cancelled'
- `limit` (optional): default 10
- `offset` (optional): default 0

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

**Logic:**
- Fetch user's campaigns (RLS auto-filter by user_id)
- Apply status filter
- Include: artworks, colors, products (relations)
- Order by created_at DESC
- Pagination

---

### 2. ⏳ get-campaign

**Endpoint:** `GET /get-campaign?id={uuid}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "...",
    "artworks": [...],
    "colors": [...],
    "products": [...]
  }
}
```

**Logic:**
- Fetch campaign với all relations
- RLS check permissions tự động
- Return full campaign object

---

### 3. ⏳ launch-campaign

**Endpoint:** `POST /launch-campaign`

**Request:**
```json
{
  "campaignId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": { campaign object }
}
```

**Logic:**
- Validate campaign exists & belongs to user
- Check required fields (artwork, colors, products)
- Update: status = 'active', starts_at = NOW(), launched_at = NOW()
- ends_at auto-calculated bởi database trigger

---

### 4. ⏳ update-campaign

**Endpoint:** `PUT /update-campaign`

**Request:**
```json
{
  "campaignId": "uuid",
  "updates": {
    "title": "New title",
    "description": "...",
    "baseCost": 25
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { updated campaign }
}
```

**Logic:**
- Validate campaign exists & belongs to user
- Validate updates (không cho đổi status tại đây)
- Update campaign record
- Return updated campaign

---

### 5. ⏳ upload-artwork

**Endpoint:** `POST /upload-artwork`

**Request:** Multipart form data
- `file`: File upload
- `campaignId`: UUID
- `side`: 'front' | 'back'

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "publicUrl": "..."
  }
}
```

**Logic:**
- Validate file (PNG/JPEG, max 50MB)
- Generate path: `{user_id}/{campaign_id}/{side}.{ext}`
- Upload to Storage bucket 'campaign-artworks'
- Insert record vào campaign_artworks table
- Return public URL

**⚠️ Note:** Storage bucket chưa được tạo do lỗi config.
- **Option 1:** Đợi fix (pause/resume project)
- **Option 2:** External storage (Cloudinary, AWS S3)
- **Option 3:** Skip tạm thời, frontend dùng base64

---

## 🔐 Authentication Pattern

Tất cả functions dùng pattern này:

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    )

    // Get user
    const { data: { user }, error } = await supabaseClient.auth.getUser()
    if (error || !user) throw new Error('Unauthorized')

    // Your logic here
    // RLS auto-filter by user_id

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

## 📊 Database Queries

### Get Campaign with Relations

```typescript
const { data, error } = await supabaseClient
  .from('campaigns')
  .select(`
    *,
    campaign_artworks(*),
    campaign_colors(*, product_colors(*)),
    campaign_products(*, products(*))
  `)
  .eq('id', campaignId)
  .single()
```

### List Campaigns

```typescript
let query = supabaseClient
  .from('campaigns')
  .select('*, campaign_artworks(*), campaign_colors(*, product_colors(*))', { count: 'exact' })
  .order('created_at', { ascending: false })

if (status) query = query.eq('status', status)
if (limit) query = query.limit(limit)
if (offset) query = query.range(offset, offset + limit - 1)

const { data, error, count } = await query
```

## 📤 Deployment

### Deploy to Production

```bash
# Deploy all functions
npx supabase functions deploy

# Deploy specific function
npx supabase functions deploy list-campaigns
```

### View Logs

```bash
# View logs
npx supabase functions logs list-campaigns

# Follow logs (real-time)
npx supabase functions logs list-campaigns --tail
```

## 🐛 Debugging

### Common Issues

**1. CORS errors**
- Check `corsHeaders` included trong response
- Handle OPTIONS requests

**2. Auth errors**
- Verify `Authorization: Bearer {token}` format
- Check token chưa expired

**3. Database errors**
- Check RLS policies
- Verify foreign keys exist
- Check constraints (unique, check)

### Test Queries in Studio

http://localhost:54323 (local)
https://app.supabase.com/project/ewhabqbenhesnskznhut/sql (production)

## ✅ Checklist

### Setup
- [ ] Install Docker Desktop
- [ ] Run `npx supabase start`
- [ ] Access Studio - verify 6 tables

### Development
- [ ] Implement `list-campaigns`
- [ ] Implement `get-campaign`
- [ ] Implement `launch-campaign`
- [ ] Implement `update-campaign`
- [ ] Implement `upload-artwork` (hoặc skip)
- [ ] Test locally
- [ ] Handle errors

### Deployment
- [ ] Test all functions
- [ ] Deploy to production
- [ ] Test on production

## 📚 Resources

- **Database Schema**: `DATABASE_SCHEMA.md`
- **Supabase Functions**: https://supabase.com/docs/guides/functions
- **Deno Docs**: https://deno.land/manual
- **Main README**: `../README.md`

## 🎯 Summary

**Có sẵn:**
- ✅ Database schema (6 tables)
- ✅ RLS policies
- ✅ Template function (save-campaign-draft)
- ✅ CORS config

**Cần làm:**
- ⏳ 5 Edge Functions
- ⏳ Local testing
- ⏳ Production deployment

Good luck! 🚀
