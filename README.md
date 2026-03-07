# Dream One Lab - Audio Storytelling Platform

A premium audio storytelling platform built with React, Supabase, and PhonePe payment integration.

## 🚀 Features

- **Audio Storytelling**: Stream audiobooks and podcasts
- **Subscription Model**: Monthly subscription for standard content
- **Special Series**: One-time purchase for premium content
- **PhonePe Integration**: Secure Indian payment gateway
- **Admin Dashboard**: Manage books, episodes, and users
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Payment**: PhonePe Payment Gateway
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- PhonePe merchant account (for payment integration)
- Google Drive API credentials (for media storage)

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/BHUVI2192/DREAM-0NE-LAB.git
cd DREAM-0NE-LAB
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Setup

1. Create a new Supabase project
2. Run the schema in Supabase SQL Editor:
   ```bash
   # Copy contents of supabase/schema.sql and run in Supabase SQL Editor
   ```

3. Deploy Edge Functions:
   ```bash
   supabase functions deploy create-phonepe-order
   supabase functions deploy phonepe-callback
   ```

4. Set Edge Function secrets:
   ```bash
   supabase secrets set PHONEPE_MERCHANT_ID=your_merchant_id
   supabase secrets set PHONEPE_SALT_KEY=your_salt_key
   supabase secrets set PHONEPE_SALT_INDEX=1
   supabase secrets set PHONEPE_API_ENDPOINT=https://api-preprod.phonepe.com/apis/pg-sandbox
   supabase secrets set APP_URL=http://localhost:5173
   ```

### 5. PhonePe Integration

1. Sign up for [PhonePe Business](https://business.phonepe.com/)
2. Get your Merchant ID and Salt Key from PhonePe dashboard
3. Configure redirect URLs in PhonePe dashboard:
   - Callback URL: `https://your-supabase-project.functions.supabase.co/phonepe-callback`
   - Redirect URL: `https://your-domain.com/payment/callback`

4. For testing, use sandbox mode:
   - Endpoint: `https://api-preprod.phonepe.com/apis/pg-sandbox`

### 6. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 7. Create Admin User

After signing up with your first account, manually set `is_admin = true` in the `profiles` table in Supabase.

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   ├── player/         # Audio player components
│   └── ui/             # UI components
├── hooks/              # Custom React hooks
├── lib/                # Library configurations
├── pages/              # Page components
│   └── admin/          # Admin pages
├── store/              # Zustand state management
└── App.jsx             # Main app component

supabase/
├── functions/          # Edge Functions
├── migrations/         # Database migrations
└── schema.sql          # Database schema
```

## 🔐 Security Notes

- Never commit `.env.local` or service account JSON files
- Use Row Level Security (RLS) policies in Supabase
- PhonePe transactions are verified with HMAC-SHA256 checksums
- All payment callbacks are server-side verified

## 🚢 Deployment

### Frontend (Vercel/Netlify)

1. Connect your GitHub repository
2. Set environment variables in deployment platform
3. Deploy!

### Supabase Edge Functions

```bash
supabase functions deploy --project-ref your-project-ref
```

## 📝 Payment Flow

1. User clicks "Subscribe" or "Unlock Book"
2. Frontend creates PhonePe order via Edge Function
3. User redirects to PhonePe payment page
4. After payment, PhonePe calls callback Edge Function
5. Callback verifies payment and updates database
6. User redirects back to app with success/failure message

## 🎨 Customization

- **Colors**: Edit `tailwind.config.js` for theme colors
- **Logo**: Replace in `Landing.jsx` and layout components
- **Pricing**: Update in `PaymentModal.jsx` and Edge Functions

## 🐛 Troubleshooting

### Payment Sandbox Issues
- Ensure you're using sandbox endpoint for testing
- Use test card numbers provided by PhonePe
- Check Edge Function logs in Supabase dashboard

### Audio Playback Issues
- Ensure audio URLs are publicly accessible
- Check CORS settings on storage provider
- Verify audio file formats (MP3, M4A, WAV)

## 📄 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 📧 Support

For issues or questions, contact: support@dreamonelab.com

---

Built with ❤️ by Dream One Lab

## Deployment

```bash
npm run build
```

Deploy the `dist/` folder to your hosting service.

## PhonePe Integration

1. Get merchant credentials from [PhonePe Business](https://business.phonepe.com)
2. Configure environment variables in Supabase
3. Deploy edge functions:
```bash
supabase functions deploy create-phonepe-order
supabase functions deploy phonepe-callback
```

## License

MIT
