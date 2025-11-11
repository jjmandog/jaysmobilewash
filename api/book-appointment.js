/**
 * Booking Appointment API Endpoint
 * Handles appointment bookings and sends notifications via email and SMS
 * Supports both package selection and custom service selection
 */

import nodemailer from 'nodemailer';
import { createBooking, isTimeSlotAvailable } from '../database/bookings.js';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Service packages and pricing - Jay's actual packages
const PACKAGES = {
  'mini-detail': { name: "Jay's Mini Detail", price: 70 },
  'luxury-detail': { name: "Jay's Luxury Detail", price: 130 },
  'max-detail': { name: "Jay's Max Detail", price: 200 },
  'ceramic-coating': { name: 'Ceramic Coating Package', price: 450 },
  'graphene-coating': { name: 'Graphene Coating Package', price: 800 }
};

// Individual services for custom packages
const SERVICES = {
  // Exterior Services
  'exterior-wash': { name: 'Two Step Hand Contact Ceramic Wash', price: 25 },
  'deep-rim-cleaning': { name: 'Deep Rim Cleaning', price: 35 },
  'wheel-wells': { name: 'Wheel Wells', price: 20 },
  'undercarriage': { name: 'Undercarriage', price: 30 },
  'trim-restoration': { name: 'Trim Restoration', price: 40 },
  'headlight-renewal': { name: 'Headlight Renewal', price: 50 },
  'chrome-cleaning': { name: 'Chrome Cleaning', price: 25 },
  'paint-rim-deiron': { name: 'Paint & Rim Deiron', price: 45 },
  'clay-bar': { name: 'Clay Bar', price: 60 },
  'sap-removal': { name: 'Sap Removal', price: 30 },

  // Interior Services
  'odor-elimination': { name: 'Odor Elimination', price: 75 },
  'gum-removal': { name: 'Gum Removal', price: 35 },
  'deep-carpet-extraction': { name: 'Deep Carpet Extraction', price: 80 },
  'steam-sanitization': { name: 'Steam Sanitization', price: 60 },
  'leather-conditioning': { name: 'Leather Conditioning', price: 45 },
  'vinyl-restore': { name: 'Vinyl Restore', price: 40 },
  'textile-cleaning': { name: 'Textile Cleaning', price: 55 },
  'cabin-air-filter-cleaning': { name: 'Cabin Air Filter Cleaning', price: 25 },
  'interior-compression': { name: 'Interior Compression (Z007 Tornador)', price: 65 },

  // Protection Services
  'hand-wax': { name: 'Hand Wax', price: 50 },
  'foam-sealant': { name: 'Foam Sealant', price: 40 }
};

export default async function handler(req, res) {
  console.log('API route called:', req.method, req.url);
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  // Set CORS headers for all responses
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request handled');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Processing POST request...');

  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      carType,
      packageType,
      customServices = [],
      surcharge = 0, // New surcharge field
      preferredDate,
      preferredTime,
      address,
      specialInstructions,
      carPhotos = [] // Photo data
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !customerEmail || !carType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for time slot availability if date and time are provided
    // Note: For serverless deployment, we'll skip database conflicts for now
    // and rely on ntfy notifications and manual conflict resolution
    if (preferredDate && preferredTime) {
      console.log(`Time slot requested: ${preferredTime} on ${preferredDate}`);
      // For now, assume all slots are available due to serverless limitations
      // TODO: Implement external database or conflict checking service
    }

    // Calculate total price and service details
    let totalPrice = 0;
    let serviceDetails = [];

    if (packageType && packageType !== 'custom') {
      const selectedPackage = PACKAGES[packageType];
      if (selectedPackage) {
        totalPrice = selectedPackage.price;
        serviceDetails.push(selectedPackage.name);
      }
    } else if (customServices.length > 0) {
      customServices.forEach(serviceId => {
        const service = SERVICES[serviceId];
        if (service) {
          totalPrice += service.price;
          serviceDetails.push(service.name);
        }
      });
    }

    // Add surcharge for Sedan vehicles
    totalPrice += surcharge;

    // Create appointment details
    const appointmentDetails = {
      bookingId: `JMW-${Date.now()}`,
      customerName,
      customerPhone,
      customerEmail,
      carType,
      services: serviceDetails,
      totalPrice,
      preferredDate,
      preferredTime,
      address,
      specialInstructions,
      carPhotos: carPhotos.length > 0 ? carPhotos.map(photo => ({
        name: photo.name,
        size: photo.size,
        dimensions: `${photo.compressedWidth}x${photo.compressedHeight}`,
        // Note: We store photo metadata, not the actual image data
        // In production, you'd upload images to cloud storage (AWS S3, Cloudinary, etc.)
        hasPhoto: true
      })) : [],
      photoCount: carPhotos.length,
      bookingDate: new Date().toISOString()
    };

    // Store booking in database (this will check for conflicts again as a safety measure)
    // Note: For serverless deployment, we'll skip database for now
    try {
      const bookingData = {
        bookingId: appointmentDetails.bookingId,
        customerName,
        customerPhone,
        customerEmail,
        carType,
        packageType,
        customServices: Array.isArray(customServices) ? customServices.join(', ') : customServices,
        surcharge, // Include surcharge in database
        totalPrice,
        preferredDate,
        preferredTime,
        address,
        specialInstructions,
        photoCount: carPhotos.length
      };

      // For serverless deployment, log booking data instead of database storage
      console.log('📋 BOOKING DATA TO BE STORED:', JSON.stringify(bookingData, null, 2));

      // TODO: In production, integrate with external database service (e.g., Vercel KV, PlanetScale)
      // createBooking(bookingData);

      console.log('✅ Booking logged successfully:', appointmentDetails.bookingId);
    } catch (dbError) {
      console.error('❌ Booking logging error:', dbError);
      // Don't fail the booking if logging fails
      console.log('⚠️  Continuing without database storage...');
    }

    // Send email notification to business owner
    await sendBusinessNotification(appointmentDetails);

    // Send confirmation email to customer
    await sendCustomerConfirmation(appointmentDetails);

    // Send ntfy notification for immediate mobile alerts
    try {
      const ntfyData = {
        customerName,
        customerPhone,
        customerEmail,
        address,
        packageType,
        carType,
        customServices: customServices.join(', '),
        totalCost: totalPrice,
        preferredDate,
        preferredTime,
        photoCount: carPhotos.length,
        specialInstructions,
        bookingId: appointmentDetails.bookingId
      };

      const ntfyResponse = await fetch(new URL('/api/ntfy-notify', req.headers.host ? `http://${req.headers.host}` : 'https://jaysmobilewash.com'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ntfyData)
      });

      if (ntfyResponse.ok) {
        console.log('✅ ntfy notification sent successfully');
      } else {
        console.warn('⚠️ ntfy notification failed:', ntfyResponse.status);
      }
    } catch (ntfyError) {
      console.error('❌ ntfy notification error:', ntfyError);
      // Don't fail the booking if notifications fail
    }

    return res.status(200).json({
      success: true,
      bookingId: appointmentDetails.bookingId,
      message: 'Appointment booked successfully! You will receive a confirmation email and we will contact you shortly.'
    });

  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to book appointment. Please try again or call 562-228-9429.'
    });
  }
}

/**
 * Send notification email to business owner
 */
async function sendBusinessNotification(appointment) {
  const emailContent = `
🚗 NEW APPOINTMENT BOOKING - Jay's Mobile Wash 🚗

Booking ID: ${appointment.bookingId}
Customer: ${appointment.customerName}
Phone: ${appointment.customerPhone}
Email: ${appointment.customerEmail}

Car Type: ${appointment.carType}
Services: ${appointment.services.join(', ')}
Total Price: $${appointment.totalPrice}

Preferred Date: ${appointment.preferredDate}
Preferred Time: ${appointment.preferredTime}
Address: ${appointment.address}

${appointment.photoCount > 0 ? `📸 Car Photos: ${appointment.photoCount} photos uploaded` : '📸 Car Photos: No photos provided'}

Special Instructions: ${appointment.specialInstructions || 'None'}

Booked on: ${new Date(appointment.bookingDate).toLocaleString()}

🔗 Contact customer immediately at ${appointment.customerPhone}
💰 Expected Revenue: $${appointment.totalPrice}
`;

  // Log notification for immediate visibility
  console.log('=== NEW BOOKING NOTIFICATION ===');
  console.log(emailContent);

  // Send SMS-style notification via email-to-SMS gateway (if configured)
  try {
    // Example using Gmail SMTP (you'll need to configure with app password)
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password (not regular password)
      }
    });

    // Send to your email for immediate notification
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'jason122295@gmail.com', // Your email
      subject: `🚗 NEW BOOKING: ${appointment.customerName} - $${appointment.totalPrice}`,
      text: emailContent,
      html: emailContent.replaceAll('\n', '<br>')
    });

    // SMS via Verizon email-to-SMS gateway
    const smsGateways = [
      '15622289429@vtext.com', // Verizon
    ];

    const smsText = `
🚗 NEW BOOKING ALERT!
${appointment.customerName}
${appointment.customerPhone}
${appointment.services.join(', ')}
$${appointment.totalPrice}
Booking: ${appointment.bookingId}
    `.trim();

    for (const gateway of smsGateways) {
      if (gateway) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: gateway,
          subject: 'NEW BOOKING',
          text: smsText
        });
      }
    }

  } catch (error) {
    console.error('Email notification failed:', error);
    // Don't fail the booking if email fails
  }
}

/**
 * Send confirmation email to customer
 */
async function sendCustomerConfirmation(appointment) {
  const emailContent = `
Hi ${appointment.customerName}!

Thank you for booking with Jay's Mobile Wash! 🚗✨

BOOKING CONFIRMATION
Booking ID: ${appointment.bookingId}
Services: ${appointment.services.join(', ')}
Total Price: $${appointment.totalPrice}
Car Type: ${appointment.carType}

APPOINTMENT DETAILS
Preferred Date: ${appointment.preferredDate}
Preferred Time: ${appointment.preferredTime}
Service Address: ${appointment.address}
${appointment.photoCount > 0 ? `Photos: ${appointment.photoCount} car photos included` : ''}

WHAT'S NEXT?
✅ We will contact you at ${appointment.customerPhone} within 2 hours to confirm your appointment
✅ We'll arrive at your location with all equipment and supplies
✅ Professional service with 100% satisfaction guarantee
✅ Payment due after service completion

Questions? Call us at 562-228-9429 or reply to this email.

Thank you for choosing Jay's Mobile Wash!
⭐⭐⭐⭐⭐ #1 Rated Mobile Car Detailing

Visit: https://jaysmobilewash.net
Follow: @jaysmobilewash
`;

  console.log('=== CUSTOMER CONFIRMATION ===');
  console.log(emailContent);

  // Send actual confirmation email to customer
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: appointment.customerEmail,
      subject: `Booking Confirmed! Jay's Mobile Wash - ${appointment.bookingId}`,
      text: emailContent,
      html: emailContent.replaceAll('\n', '<br>')
    });

  } catch (error) {
    console.error('Customer confirmation email failed:', error);
    // Don't fail the booking if email fails
  }
}
