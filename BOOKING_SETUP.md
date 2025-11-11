# Jay's Mobile Wash - Booking System Setup Guide

## 🚗 Overview
This booking system allows customers to:
- Choose from predefined service packages OR create custom packages
- Select vehicle type
- Provide contact information and preferred appointment time
- Submit booking requests that send notifications to your phone and email

## 📱 Notification Setup

### Email Notifications
The system sends two types of emails:
1. **Business notification** to you (with booking details)
2. **Customer confirmation** email to the customer

### Quick Email Setup (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → App passwords
   - Generate password for "Mail"
3. **Add Environment Variables** to Vercel:

```bash
EMAIL_USER=jason122295@gmail.com
EMAIL_APP_PASSWORD=your-16-character-app-password
```

### SMS Notifications via Email-to-SMS Gateway

To receive instant SMS alerts, your Verizon number is configured:

```javascript
// In pages/api/book-appointment.js
const smsGateways = [
  '15622289429@vtext.com',  // Verizon
];
```

**Verizon SMS Gateway**: `phone@vtext.com`

## 🎨 Features Included

### Service Packages
- **Basic Wash & Vacuum** - $80
- **Interior Detail Package** - $150
- **Exterior Detail Package** - $180
- **Full Detail Package** - $250
- **Ceramic Coating Package** - $400
- **Paint Correction Package** - $350
- **Premium Detail Package** - $320

### Custom Services
- Wash & Dry - $40
- Vacuum Interior - $30
- Steam Clean Interior - $60
- Enzyme Extraction - $80
- Ceramic Coating Application - $200
- Paint Correction - $150
- Headlight Restoration - $60
- Clay Bar Treatment - $70
- Iron Removal - $50
- Trim Restoration - $40
- Engine Bay Cleaning - $80
- Pet Hair Removal - $50
- Bio-Bomb Odor Removal - $100
- Wax & Sealant - $60

### Vehicle Types Supported
- Sedan, SUV, Truck, Sports Car, Luxury, Van, Motorcycle, Other

## 🚀 Deployment Instructions

1. **Deploy to Vercel**:
```bash
npx vercel --prod
```

2. **Add Environment Variables** in Vercel Dashboard:
   - Go to your project settings
   - Environment Variables section
   - Add `EMAIL_USER` and `EMAIL_APP_PASSWORD`

3. **Test the booking system** on your live site

## 📋 Booking Process Flow

1. **Customer clicks "Book Now"** button (appears on homepage)
2. **Step 1: Service Selection**
   - Choose package OR custom services
   - Select vehicle type
3. **Step 2: Customer Information**
   - Name, phone, email (required)
   - Service address (required)
   - Preferred date/time (optional)
   - Special instructions (optional)
4. **Step 3: Confirmation**
   - Review all details
   - Submit booking
5. **Notifications Sent**:
   - Email to you with booking details
   - SMS to your phone (if configured)
   - Confirmation email to customer

## 🎯 Button Locations

The "Book Now" button automatically appears in:
- Hero section (main button)
- Floating button (bottom-right corner)
- Navigation areas
- Service sections

## 📞 Contact Integration

When bookings are submitted, you'll receive:
- **Email notification** with customer details
- **SMS alert** (if gateway configured)
- Customer phone number for immediate callback

## 🔧 Customization

### Update Pricing
Edit `pages/api/book-appointment.js` and `booking-system.js` to modify service prices.

### Add/Remove Services
Update the `SERVICES` object in both files to customize available services.

### Change Business Contact Info
Update the confirmation email template in `sendCustomerConfirmation()` function.

## 🛟 Support

If you need help setting up email notifications or customizing the booking system:
1. Check the Vercel deployment logs
2. Test the API endpoint directly at `/api/book-appointment`
3. Verify environment variables are set correctly

The system is designed to work even if email fails - customers will still see a confirmation message and you can access booking details through the API logs.