/**
 * Book Appointment API Endpoint
 * Handles booking form submissions
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }
    
    try {
        const bookingData = req.body;
        
        // Validate required fields
        const requiredFields = ['customerName', 'customerPhone', 'customerEmail', 'address'];
        for (const field of requiredFields) {
            if (!bookingData[field]) {
                return res.status(400).json({
                    success: false,
                    error: `Missing required field: ${field}`
                });
            }
        }
        
        // Generate booking ID
        const bookingId = 'JMW-' + Date.now().toString(36).toUpperCase();
        
        // Log booking data (in production, save to database)
        console.log('📅 NEW BOOKING RECEIVED:');
        console.log('Booking ID:', bookingId);
        console.log('Customer:', bookingData.customerName);
        console.log('Phone:', bookingData.customerPhone);
        console.log('Email:', bookingData.customerEmail);
        console.log('Address:', bookingData.address);
        console.log('Package:', bookingData.packageType);
        console.log('Car Type:', bookingData.carType);
        console.log('Photos:', bookingData.carPhotos ? bookingData.carPhotos.length : 0);
        
        // In production, you would:
        // 1. Save to database
        // 2. Send confirmation email
        // 3. Send SMS notification
        // 4. Add to calendar
        
        // For now, simulate successful booking
        const response = {
            success: true,
            bookingId: bookingId,
            message: 'Booking received successfully',
            customerName: bookingData.customerName,
            confirmationDetails: {
                bookingId: bookingId,
                customerName: bookingData.customerName,
                phone: bookingData.customerPhone,
                email: bookingData.customerEmail,
                address: bookingData.address,
                packageType: bookingData.packageType,
                carType: bookingData.carType,
                scheduledDate: bookingData.preferredDate,
                scheduledTime: bookingData.preferredTime,
                photosUploaded: bookingData.carPhotos ? bookingData.carPhotos.length : 0,
                submittedAt: new Date().toISOString()
            }
        };
        
        // Send SMS notification (if you have SMS service configured)
        try {
            const smsData = {
                to: "5622289429@vtext.com", // Replace with your actual SMS gateway
                text: `🚗 NEW BOOKING: ${bookingData.customerName} - ${bookingData.customerPhone} - ${bookingData.packageType} - ${bookingData.address} - ID: ${bookingId}`,
                from: "bookings@jaysmobilewash.net"
            };
            
            // You can enable this when SMS is configured
            // await fetch('/api/send-sms', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(smsData)
            // });
            
        } catch (smsError) {
            console.log('SMS notification failed:', smsError);
            // Don't fail the booking if SMS fails
        }
        
        res.status(200).json(response);
        
    } catch (error) {
        console.error('Booking API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again'
        });
    }
}