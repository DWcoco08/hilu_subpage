# Database Schema Documentation

## Overview

Schema thiết kế cho Subpage print-on-demand platform với đầy đủ tính năng quản lý campaigns, products, artworks và Row Level Security.

## Database Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
│   (built-in)    │
└────────┬────────┘
         │
         │ user_id (FK)
         │
         ▼
┌─────────────────────────────────────────────┐
│              campaigns                      │
│─────────────────────────────────────────────│
│ id (PK)                                     │
│ user_id (FK) → auth.users                   │
│ title, slug, description, creator_name      │
│ base_cost, profit, selling_price (computed) │
│ currency, campaign_duration, sales_goal     │
│ status, starts_at, ends_at                  │
│ featured_product_id (FK), featured_color_id │
│ created_at, updated_at, launched_at         │
└──────────┬──────────────────────────────────┘
           │
           ├─────────────┬──────────────┬──────────────┐
           │             │              │              │
           ▼             ▼              ▼              ▼
   ┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌─────────────┐
   │   campaign   │ │  campaign   │ │   campaign   │ │   products  │
   │   artworks   │ │   colors    │ │   products   │ │─────────────│
   │──────────────│ │─────────────│ │──────────────│ │ id (PK)     │
   │ id (PK)      │ │ id (PK)     │ │ id (PK)      │ │ name        │
   │ campaign_id  │ │ campaign_id │ │ campaign_id  │ │ type        │
   │ side         │ │ color_id ──┼─┼─┼──────────────┼─│ gender      │
   │ storage_path │ │ is_featured │ │ product_id   │ │ fit         │
   │ file_name    │ └─────────────┘ └──────────────┘ │ base_cost   │
   │ file_size    │                                  │ is_active   │
   │ mime_type    │                                  └─────────────┘
   │ width,height │
   └──────────────┘
                           │
                           ▼
                   ┌──────────────┐
                   │product_colors│
                   │──────────────│
                   │ id (PK)      │
                   │ color_id     │
                   │ name         │
                   │ hex_code     │
                   └──────────────┘
```

## Tables

### 1. **campaigns**
Main table lưu trữ thông tin campaign.

**Columns:**
- `id` (UUID, PK) - Campaign ID
- `user_id` (UUID, FK) - Creator của campaign (references auth.users)
- `title` (TEXT) - Tên campaign
- `slug` (TEXT, UNIQUE) - URL-friendly identifier (auto-generated)
- `description` (TEXT) - Mô tả campaign (max 150 chars)
- `creator_name` (TEXT) - Tên người tạo
- `base_cost` (DECIMAL) - Giá gốc sản phẩm (default: 20.00)
- `profit` (DECIMAL) - Lợi nhuận/sản phẩm (default: 5.00)
- `selling_price` (DECIMAL, COMPUTED) - Giá bán = base_cost + profit
- `currency` (TEXT) - 'GBP', 'USD', 'EUR'
- `campaign_duration` (INTEGER) - Số ngày campaign (7-365)
- `sales_goal` (INTEGER) - Mục tiêu bán (1-1250)
- `starts_at` (TIMESTAMP) - Ngày bắt đầu
- `ends_at` (TIMESTAMP) - Ngày kết thúc (auto-calculated)
- `status` (TEXT) - 'draft', 'active', 'completed', 'cancelled'
- `featured_product_id` (UUID, FK) - Sản phẩm nổi bật
- `featured_color_id` (UUID, FK) - Màu nổi bật
- `created_at`, `updated_at`, `launched_at` (TIMESTAMP)

**Indexes:**
- `user_id`, `status`, `slug`, `created_at`

**Triggers:**
- Auto-update `updated_at` on UPDATE
- Auto-calculate `ends_at` from `starts_at` + `campaign_duration`

---

### 2. **campaign_artworks**
Lưu trữ artwork files (front/back designs).

**Columns:**
- `id` (UUID, PK)
- `campaign_id` (UUID, FK) - References campaigns
- `side` (TEXT) - 'front' hoặc 'back'
- `storage_path` (TEXT) - Đường dẫn file trong Supabase Storage
- `file_name` (TEXT) - Tên file gốc
- `file_size` (INTEGER) - Kích thước file (bytes)
- `mime_type` (TEXT) - MIME type (image/png, image/jpeg)
- `width`, `height` (INTEGER) - Kích thước ảnh
- `created_at` (TIMESTAMP)

**Constraints:**
- UNIQUE(campaign_id, side) - Mỗi campaign chỉ có 1 front và 1 back

**Indexes:**
- `campaign_id`

---

### 3. **campaign_colors**
Junction table - Màu sắc được chọn cho campaign.

**Columns:**
- `id` (UUID, PK)
- `campaign_id` (UUID, FK) - References campaigns
- `color_id` (UUID, FK) - References product_colors
- `is_featured` (BOOLEAN) - Màu nổi bật hay không
- `created_at` (TIMESTAMP)

**Constraints:**
- UNIQUE(campaign_id, color_id) - Không duplicate màu

**Indexes:**
- `campaign_id`

---

### 4. **campaign_products**
Junction table - Sản phẩm được chọn cho campaign.

**Columns:**
- `id` (UUID, PK)
- `campaign_id` (UUID, FK) - References campaigns
- `product_id` (UUID, FK) - References products
- `created_at` (TIMESTAMP)

**Constraints:**
- UNIQUE(campaign_id, product_id) - Không duplicate product

**Indexes:**
- `campaign_id`

---

### 5. **products**
Catalog sản phẩm (t-shirts, hoodies, etc.).

**Columns:**
- `id` (UUID, PK)
- `name` (TEXT) - Tên sản phẩm
- `product_type` (TEXT) - 'tshirt', 'hoodie', etc.
- `gender` (TEXT) - 'male', 'female', 'unisex'
- `fit` (TEXT) - 'regular', 'slim', 'oversized'
- `base_cost` (DECIMAL) - Giá gốc (default: 20.00)
- `is_active` (BOOLEAN) - Hiển thị hay không
- `created_at`, `updated_at` (TIMESTAMP)

**Pre-populated:**
- "Essentials Classic Tee" (tshirt, unisex, regular, £20)

**Triggers:**
- Auto-update `updated_at` on UPDATE

---

### 6. **product_colors**
Danh sách màu sắc có sẵn.

**Columns:**
- `id` (UUID, PK)
- `color_id` (TEXT, UNIQUE) - Machine name ('white', 'black', etc.)
- `name` (TEXT) - Display name
- `hex_code` (TEXT) - Hex color (#ffffff, etc.)
- `created_at` (TIMESTAMP)

**Pre-populated (from colors.json):**
```
white    → White     → #ffffff
black    → Black     → #000000
navy     → Navy      → #1e2847
grey     → Grey      → #9e9e9e
red      → Red       → #ff0000
darkblue → Dark Blue → #003366
darkgreen→ Dark Green→ #006400
cream    → Cream     → #f5deb3
```

**Indexes:**
- `color_id`

---

## Row Level Security (RLS)

### Campaigns
✅ **Authenticated users:**
- SELECT: Own campaigns
- INSERT: Own campaigns only
- UPDATE: Own campaigns only
- DELETE: Own campaigns only

✅ **Public:**
- SELECT: Active campaigns only

### Campaign Artworks
✅ **Authenticated users:**
- SELECT: Own campaign artworks
- INSERT: Own campaign artworks
- DELETE: Own campaign artworks

✅ **Public:**
- SELECT: Artworks of active campaigns

### Campaign Colors & Products
✅ **Authenticated users:**
- ALL operations: Own campaigns only

✅ **Public:**
- SELECT: Data from active campaigns

### Products & Product Colors
✅ **Everyone:**
- SELECT: Active products and all colors (read-only)

---

## Storage Bucket

### `campaign-artworks`
- **Public:** false (authenticated access only)
- **Max file size:** 50MB (from config.toml)
- **Allowed formats:** PNG, JPEG

**Folder structure:**
```
campaign-artworks/
  {user_id}/
    {campaign_id}/
      front.png
      back.png
```

**Storage Policies:**
✅ **Authenticated users:**
- Upload to own folder: `/{user_id}/...`
- View own files
- Delete own files

✅ **Public:**
- View artworks from active campaigns

---

## Helper Functions

### `generate_unique_slug(title, campaign_id)`
Tự động tạo slug từ title, thêm suffix nếu trùng.

**Examples:**
- "My Cool T-Shirt" → "my-cool-t-shirt"
- "My Cool T-Shirt" (duplicate) → "my-cool-t-shirt-1"

### `set_campaign_dates()`
Tự động tính `ends_at` = `starts_at` + `campaign_duration` days

### `update_updated_at_column()`
Auto-update `updated_at` timestamp khi UPDATE record

---

## Usage Examples

### 1. Create a new campaign
```sql
INSERT INTO campaigns (
  user_id, title, description, creator_name,
  base_cost, profit, currency,
  campaign_duration, sales_goal
) VALUES (
  auth.uid(),
  'Awesome T-Shirt Campaign',
  'Cool designs for everyone!',
  'John Doe',
  20.00, 5.00, 'GBP',
  14, 100
) RETURNING id, slug;
```

### 2. Add artwork
```sql
INSERT INTO campaign_artworks (
  campaign_id, side, storage_path, file_name, mime_type
) VALUES (
  '{campaign_id}',
  'front',
  '{user_id}/{campaign_id}/front.png',
  'my-design.png',
  'image/png'
);
```

### 3. Add colors to campaign
```sql
-- Get color IDs first
SELECT id, color_id, name FROM product_colors WHERE color_id IN ('white', 'black', 'navy');

-- Insert selected colors
INSERT INTO campaign_colors (campaign_id, color_id, is_featured)
VALUES
  ('{campaign_id}', '{white_color_id}', false),
  ('{campaign_id}', '{black_color_id}', true),
  ('{campaign_id}', '{navy_color_id}', false);
```

### 4. Launch campaign
```sql
UPDATE campaigns
SET status = 'active',
    starts_at = NOW(),
    launched_at = NOW()
WHERE id = '{campaign_id}' AND user_id = auth.uid();
```

### 5. Get campaign with all details
```sql
SELECT
  c.*,
  json_agg(DISTINCT ca.*) FILTER (WHERE ca.id IS NOT NULL) as artworks,
  json_agg(DISTINCT jsonb_build_object(
    'color_id', pc.color_id,
    'name', pc.name,
    'hex_code', pc.hex_code,
    'is_featured', cc.is_featured
  )) FILTER (WHERE cc.id IS NOT NULL) as colors,
  json_agg(DISTINCT p.*) FILTER (WHERE p.id IS NOT NULL) as products
FROM campaigns c
LEFT JOIN campaign_artworks ca ON ca.campaign_id = c.id
LEFT JOIN campaign_colors cc ON cc.campaign_id = c.id
LEFT JOIN product_colors pc ON pc.id = cc.color_id
LEFT JOIN campaign_products cp ON cp.campaign_id = c.id
LEFT JOIN products p ON p.id = cp.product_id
WHERE c.id = '{campaign_id}'
GROUP BY c.id;
```

---

## Migration Instructions

### Local Development (Docker required)

1. **Start Supabase:**
   ```bash
   cd E:\Intern\subpage\subpage_be
   npx supabase start
   ```

2. **Apply migration:**
   ```bash
   npx supabase db reset
   ```
   Hoặc:
   ```bash
   npx supabase migration up
   ```

3. **Verify:**
   - Supabase Studio: http://localhost:54323
   - Check tables, policies, storage bucket

### Production Deployment

1. **Link to remote project:**
   ```bash
   npx supabase link --project-ref your-project-ref
   ```

2. **Push migration:**
   ```bash
   npx supabase db push
   ```

3. **Verify on dashboard:**
   - https://app.supabase.com/project/{project-ref}/editor

---

## Notes

- **Selling price** được tính tự động: `base_cost + profit`
- **Campaign slug** được generate tự động từ title
- **Campaign end date** được tính tự động từ start date + duration
- **RLS** đảm bảo users chỉ thấy/sửa campaigns của mình
- **Storage** tổ chức theo folder `{user_id}/{campaign_id}/`
- **Public access** chỉ cho active campaigns

## Next Steps

1. Start Docker Desktop
2. Run `npx supabase start`
3. Run `npx supabase db reset`
4. Implement Edge Functions với schema này
5. Update Frontend để gọi APIs
