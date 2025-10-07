# Subpage - Print-on-Demand Campaign Platform

Monorepo đơn giản cho nền tảng tạo và quản lý chiến dịch print-on-demand.

## Cấu trúc dự án

```
subpage/
├── subpage_be/          # Backend - Supabase Edge Functions
│   └── supabase/
│       └── functions/
│           ├── upload-artwork/
│           ├── save-campaign-draft/
│           ├── launch-campaign/
│           ├── get-campaign/
│           ├── list-campaigns/
│           └── update-campaign/
│
└── subpage_fe/          # Frontend - React App
    ├── src/
    ├── public/
    └── package.json
```

## Backend (subpage_be)

**Tech Stack:**
- Supabase Edge Functions (Deno runtime)
- PostgreSQL database
- Supabase Storage (file uploads)

### Edge Functions (6 functions)

**Wizard Workflow:**
1. `upload-artwork` - Upload artwork file (Bước 1)
2. `save-campaign-draft` - Lưu prices, duration, products (Bước 2-3)
3. `launch-campaign` - Publish campaign (Bước 4)

**Campaign Management:**
4. `get-campaign` - Lấy chi tiết 1 campaign
5. `list-campaigns` - Danh sách tất cả campaigns
6. `update-campaign` - Cập nhật campaign

### Setup Backend

```bash
cd subpage_be

# Start local Supabase
npx supabase start

# Deploy functions
npx supabase functions deploy
```

## Frontend (subpage_fe)

**Tech Stack:**
- React 18
- Create React App
- Plain CSS

**Wizard Steps:**
1. **Upload Artwork** - Drag-and-drop interface
2. **Set Prices & Duration** - Configure pricing and campaign duration
3. **Select Products** - Choose product colors and types
4. **Edit Page & Launch** - Customize and publish campaign

### Setup Frontend

```bash
cd subpage_fe

# Install dependencies
npm install

# Run development server
npm start
```

App chạy tại: `http://localhost:3000`

## Database Schema

### Campaigns Table
```sql
campaigns (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  status TEXT, -- 'draft', 'active', 'completed'
  base_price DECIMAL,
  duration_days INTEGER,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Artworks Table
```sql
artworks (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  uploaded_at TIMESTAMP
)
```

### Products Table
```sql
products (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  type TEXT, -- 't-shirt', 'hoodie', etc.
  color TEXT,
  price DECIMAL,
  created_at TIMESTAMP
)
```

## API Endpoints

### Wizard Flow

**1. Upload Artwork**
```
POST /upload-artwork
Body: FormData với file
Response: { artwork_id, file_url }
```

**2. Save Draft**
```
POST /save-campaign-draft
Body: {
  name: "Campaign name",
  base_price: 25.00,
  duration_days: 14,
  products: [
    { type: "t-shirt", color: "black", price: 30 },
    { type: "hoodie", color: "white", price: 45 }
  ],
  artwork_id: "uuid"
}
Response: { campaign_id, status: "draft" }
```

**3. Launch Campaign**
```
POST /launch-campaign
Body: {
  campaign_id: "uuid",
  page_title: "My Campaign",
  page_description: "Description..."
}
Response: { campaign_id, status: "active", published_at }
```

### Campaign Management

**Get Campaign**
```
GET /get-campaign?id={campaign_id}
Response: { id, name, status, products, artwork, ... }
```

**List Campaigns**
```
GET /list-campaigns
Response: {
  campaigns: [
    { id, name, status, created_at, ... },
    ...
  ]
}
```

**Update Campaign**
```
PUT /update-campaign
Body: {
  campaign_id: "uuid",
  name: "New name",
  base_price: 30.00
}
Response: { updated campaign }
```

## Phân công công việc

### Backend Team (6 Edge Functions)

**Task 1: Database Setup**
- Tạo migrations cho 3 tables: campaigns, artworks, products
- Test insert/query data

**Task 2: Upload Artwork**
- Code logic upload file lên Supabase Storage
- Lưu thông tin file vào bảng `artworks`
- Return artwork_id và file_url

**Task 3: Save Campaign Draft**
- Nhận data từ wizard steps 2-3
- Insert vào bảng `campaigns` với status='draft'
- Insert products vào bảng `products`
- Return campaign_id

**Task 4: Launch Campaign**
- Update campaign status từ 'draft' sang 'active'
- Set start_date, end_date
- Return campaign info

**Task 5: Get Campaign**
- Query campaign từ DB theo id
- Join với artworks và products
- Return full campaign data

**Task 6: List & Update**
- List: Query tất cả campaigns, sort by created_at
- Update: Update campaign fields

### Frontend Team
- ✅ UI components hoàn tất
- ⏳ Tạo API service functions
- ⏳ Tích hợp 6 API endpoints vào wizard
- ⏳ Handle loading states & errors

## Development Workflow

1. Backend: Tạo database migrations
2. Backend: Code 6 Edge Functions (mỗi người 1-2 functions)
3. Backend: Test functions với curl/Postman
4. Frontend: Tích hợp API vào wizard
5. Test end-to-end workflow
6. Deploy

## Notes

- Mỗi Edge Function có file `index.ts` và `deno.json`
- Không cần authentication (đơn giản cho newbie)
- Không cần shared code (mỗi function tự xử lý)
- Focus vào core workflow: Upload → Save → Launch
