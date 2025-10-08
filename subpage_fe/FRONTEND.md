# Frontend - Subpage Campaign Platform

React frontend cho Subpage print-on-demand platform.

## 🚀 Tech Stack

- **React** 18.2.0
- **Vite** 5.1.0
- **Supabase Client** (đã cài)
- **CSS** Vanilla

## 📁 Structure

```
src/
├── components/              # React components
│   ├── Header/
│   ├── UploadArtwork/      # Step 1
│   ├── SetPricesDuration/  # Step 2
│   └── EditPageLaunch/     # Step 3
│
├── lib/
│   └── supabase.js         # ✅ Supabase client config
│
├── services/               # ✅ API services (đã setup)
│   ├── campaigns.js        # Campaign CRUD
│   ├── artworks.js         # Artwork upload
│   ├── colors.js           # Color management
│   ├── products.js         # Product management
│   └── index.js            # Export all
│
├── App.jsx                 # Main app - 3-step wizard
└── main.jsx                # Entry point
```

## ✅ Đã Setup

- ✅ Supabase client (`src/lib/supabase.js`)
- ✅ Authentication helpers
- ✅ Services layer (campaigns, artworks, colors, products)
- ✅ Environment variables (`.env`)

## 🛠️ Quick Start

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Access: http://localhost:3000

### Build

```bash
npm run build
```

## 🔧 Environment Variables

File `.env` đã được config:

```env
VITE_SUPABASE_URL=https://ewhabqbenhesnskznhut.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**⚠️ Không commit `.env` vào Git** (đã có trong `.gitignore`)

## 📝 Services Usage

### Import Services

```javascript
import { campaigns, artworks, colors, products } from './services'
// Hoặc
import { supabase } from './lib/supabase'
```

### Examples

**1. List Campaigns**
```javascript
const { data, error } = await campaigns.listCampaigns()
```

**2. Save Campaign Draft**
```javascript
const { data, error } = await campaigns.saveCampaignDraft({
  campaignTitle: 'My Campaign',
  description: 'Cool design',
  creatorName: 'John Doe',
  baseCost: 20,
  profit: 5,
  currency: 'GBP',
  campaignDuration: 14,
  salesGoal: 100,
})
```

**3. Upload Artwork**
```javascript
const file = event.target.files[0]
const { data, error } = await artworks.uploadArtwork(
  file,
  campaignId,
  'front'
)
```

**4. Get Product Colors**
```javascript
const { data, error } = await colors.getProductColors()
// Returns 8 pre-populated colors
```

## 👥 TODO - Team Frontend

### 1. Authentication UI

**Cần implement:**
- Login page
- Signup page
- Protected routes
- User session management

**Helper có sẵn:**
```javascript
import { auth } from './lib/supabase'

// Sign up
await auth.signUp(email, password)

// Sign in
await auth.signIn(email, password)

// Sign out
await auth.signOut()

// Get current user
const { user } = await auth.getUser()

// Listen to auth changes
auth.onAuthStateChange((event, session) => {
  console.log(event, session)
})
```

### 2. Update Components

**App.jsx:**
- Replace `alert()` trong `handleNext()` và `handleLaunch()`
- Gọi `campaigns.saveCampaignDraft()` thực tế
- Handle loading states
- Handle errors

**UploadArtwork.jsx:**
- Replace `alert('Artwork saved!')`
- Call `artworks.uploadArtwork()`
- Show upload progress
- Handle upload errors

**EditPageLaunch.jsx:**
- Replace `alert('Campaign launched!')`
- Call `campaigns.launchCampaign()`
- Redirect sau khi launch thành công
- Show success message

### 3. Add Features

- [ ] Loading spinners
- [ ] Error messages (toast/modal)
- [ ] Success notifications
- [ ] Form validation
- [ ] Campaign list page (dashboard)
- [ ] Campaign detail/edit page

## 🔍 Database Access

Services layer có thể gọi database trực tiếp (RLS bảo vệ):

```javascript
// Direct database query
const { data, error } = await supabase
  .from('campaigns')
  .select('*')
  .eq('user_id', userId)
```

Hoặc đợi team backend làm xong Edge Functions rồi gọi API:

```javascript
// Call Edge Function
const response = await fetch(
  'https://ewhabqbenhesnskznhut.supabase.co/functions/v1/list-campaigns',
  {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  }
)
```

## 🎨 Current Features

**3-Step Wizard:**
1. **Upload Artwork** - Upload front/back designs, chọn colors & products
2. **Set Prices & Duration** - Config pricing, currency, duration, sales goal
3. **Edit Page & Launch** - Review, edit details, launch campaign

**State Management:**
- Campaign data stored trong `App.jsx` state
- Passed down via props

## 🐛 Known Issues

1. **Storage Upload** - Storage bucket chưa được tạo
   - **Workaround**: Dùng `artworks.fileToBase64()` để convert ảnh
   - Hoặc dùng external storage (Cloudinary)

2. **Alerts** - Đang dùng `alert()` thay vì proper UI
   - **TODO**: Replace bằng toast notifications

## 📚 Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase JS Client**: https://supabase.com/docs/reference/javascript
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

## 🔒 Security

- ✅ Chỉ dùng `anon key` (public key) ở frontend
- ✅ RLS policies bảo vệ database
- ✅ User chỉ thấy/sửa campaigns của mình
- ❌ **KHÔNG BAO GIỜ** dùng `service_role key` ở frontend

## 📞 Support

**Cần help?**
- Check services layer: `src/services/*.js`
- Check Supabase config: `src/lib/supabase.js`
- Database schema: `../subpage_be/DATABASE_SCHEMA.md`
- Main README: `../README.md`
