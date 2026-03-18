# 🚀 DATABASE SETUP INSTRUCTIONS

## The Problem
Your Supabase database needs both the current schema and the latest RLS compatibility fixes. Running only one script can leave the app in a half-working state.

## The Solution (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: `qdyyofxlfjljrfaakwbi`
3. Click on **SQL Editor** in the left sidebar
4. Click **+ New Query**

### Step 2: Run the Schema Script
1. Open the file `supabase/schema.sql` in this project
2. Copy ALL the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Run the Compatibility Fix Script
1. Open the file `supabase/FIX_ALL_ERRORS.sql` in this project
2. Copy ALL the SQL code
3. Paste it into a new SQL Editor tab
4. Click **Run** (or press Ctrl+Enter)

### Step 4: Refresh Your App
1. Go back to your browser with the app open
2. Press `Ctrl + Shift + R` (hard refresh to clear cache)
3. The core app and admin access rules should now be aligned

## What These Scripts Do

✅ Creates and updates the current app schema  
✅ Adds subscription-related tables and columns  
✅ Adds compatibility fixes for alerts, subscriptions, and admin access  
✅ Fixes recursive RLS/admin policy issues  
✅ Grants admin access to cnbhuvan011@gmail.com  
✅ Makes published content visible with current policies

## After Setup

You'll be able to:
- ✅ See all books on the homepage
- ✅ Subscribe to premium plans
- ✅ Distinguish between regular books and special series
- ✅ Access admin panel at `/admin/dashboard`
- ✅ Upload book covers and audio files

## Troubleshooting

**If you still see errors after running the script:**
1. Clear browser cache completely (Ctrl + Shift + Delete)
2. Close and reopen the dev server (`npm run dev`)
3. Check Supabase Dashboard > Table Editor to verify tables exist

**Need help?** Check the console errors - they should be gone after this setup!
