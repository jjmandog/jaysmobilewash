#!/bin/bash
# Jay's Mobile Wash - Email Setup Script
# This script helps configure the booking system notifications

echo "🚗 Jay's Mobile Wash - Booking System Setup"
echo "=========================================="
echo ""

echo "Your booking system is configured for:"
echo "📧 Email: jason122295@gmail.com"
echo "📱 Phone: 562-228-9429"
echo ""

echo "📋 To complete the setup, you need to:"
echo ""

echo "1️⃣ SET UP GMAIL APP PASSWORD:"
echo "   • Go to Google Account settings"
echo "   • Security → 2-Step Verification (enable if not already)"
echo "   • Security → App passwords"
echo "   • Generate app password for 'Mail'"
echo "   • Copy the 16-character password"
echo ""

echo "2️⃣ ADD ENVIRONMENT VARIABLES TO VERCEL:"
echo "   • Go to https://vercel.com/dashboard"
echo "   • Select your jaysmobilewash project"
echo "   • Settings → Environment Variables"
echo "   • Add these variables:"
echo ""
echo "   Variable: EMAIL_USER"
echo "   Value: jason122295@gmail.com"
echo ""
echo "   Variable: EMAIL_APP_PASSWORD" 
echo "   Value: [your-16-character-app-password]"
echo ""

echo "3️⃣ REDEPLOY TO ACTIVATE:"
echo "   Run: npx vercel --prod"
echo ""

echo "4️⃣ SMS NOTIFICATIONS (VERIZON):"
echo "   Your phone number (562-228-9429) is configured for:"
echo "   • Verizon: 15622289429@vtext.com"
echo ""
echo "   SMS alerts will be sent directly to your Verizon number."
echo ""

echo "🎯 WHAT HAPPENS WHEN CUSTOMERS BOOK:"
echo "   ✅ Email notification sent to jason122295@gmail.com"
echo "   ✅ SMS alert sent to 562-228-9429 (if carrier gateway works)"
echo "   ✅ Customer gets confirmation email"
echo "   ✅ All booking details included (name, phone, services, address)"
echo ""

echo "🔧 Test your setup after configuring environment variables!"
echo "📞 Questions? The booking system is already live and working!"