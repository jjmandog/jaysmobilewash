# Jay's Mobile Wash - Email & SMS Setup Guide

## ✅ CONFIGURED FOR YOU:
- **Email**: jason122295@gmail.com
- **Phone**: 562-228-9429
- **SMS Gateways**: All major carriers configured

## 🔧 COMPLETE SETUP (2 STEPS):

### Step 1: Gmail App Password Setup

1. **Go to Google Account settings**: https://myaccount.google.com
2. **Security** → **2-Step Verification** (enable if not already on)
3. **Security** → **App passwords**
4. **Generate app password for "Mail"**
5. **Copy the 16-character password** (example: `abcd efgh ijkl mnop`)

### Step 2: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your `jaysmobilewash` project**
3. **Settings** → **Environment Variables**
4. **Add these 2 variables**:

```
Variable Name: EMAIL_USER
Value: jason122295@gmail.com

Variable Name: EMAIL_APP_PASSWORD
Value: [paste your 16-character app password here]
```

5. **Save** and **Redeploy**: Run `npx vercel --prod`

## 📱 SMS NOTIFICATIONS (VERIZON CONFIGURED):

Your phone number is set up for Verizon:
- **Verizon**: `15622289429@vtext.com`

SMS alerts will be sent directly to your Verizon number when customers book appointments.

## 🎯 WHAT HAPPENS WHEN CUSTOMERS BOOK:

### You Receive:
- **📧 Email notification** with full booking details
- **📱 SMS alert** to 562-228-9429 with key info
- **Customer contact info** for immediate callback

### Customer Receives:
- **✅ Confirmation email** with booking details
- **📋 Booking ID** for reference
- **📞 Your contact info** (562-228-9429)

### Email Content Includes:
- Customer name, phone, email
- Services selected & total price
- Preferred date/time
- Service address
- Special instructions
- Unique booking ID

## 🚀 TESTING:

After setting up environment variables:
1. **Redeploy**: `npx vercel --prod`
2. **Visit your live site**: https://jaysmobilewash.net
3. **Click "Book Now"** and test with your own info
4. **Check your email and phone** for notifications

## 📞 SUPPORT:

If you need help with Gmail App Password setup:
- Google Support: https://support.google.com/accounts/answer/185833

The booking system is already live and functional - just add the email credentials to activate notifications!