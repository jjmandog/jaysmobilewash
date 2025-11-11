/**
 * ntfy Notification API Endpoint
 * Sends booking notifications to ntfy.sh from server-side (no CORS issues)
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const bookingData = req.body;
        
        // Create notification message
        const message = `🚗 NEW BOOKING REQUEST

👤 Customer: ${bookingData.customerName}
📱 Phone: ${bookingData.customerPhone}
📧 Email: ${bookingData.customerEmail}
🏠 Address: ${bookingData.address}

🚙 Service: ${bookingData.packageType}
🚗 Car Type: ${bookingData.carType}
➕ Add-ons: ${bookingData.customServices}
💰 TOTAL: $${bookingData.totalCost}

📅 Date: ${bookingData.preferredDate}
🕐 Time: ${bookingData.preferredTime}
📸 Photos: ${bookingData.photoCount} uploaded
📝 Notes: ${bookingData.specialInstructions}

🆔 Booking ID: ${bookingData.bookingId}

⚡ CALL ${bookingData.customerPhone} TO CONFIRM!`;

        // Send to ntfy.sh via server-side fetch (no CORS issues)
        const ntfyResponse = await fetch('https://ntfy.sh/jays-wash-alerts-2025', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'Title': `🚗 NEW BOOKING: ${bookingData.customerName}`,
                'Priority': 'high',
                'Tags': 'car,booking,urgent'
            },
            body: message
        });

        // Also send to backup topic
        const backupResponse = await fetch('https://ntfy.sh/jays-wash-alerts-backup', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'Title': `🚗 Booking Alert: ${bookingData.customerName}`,
                'Priority': '4',
                'Tags': 'car,booking'
            },
            body: `NEW BOOKING: ${bookingData.customerName}\nPhone: ${bookingData.customerPhone}\nTotal: $${bookingData.totalCost}\nDate: ${bookingData.preferredDate} ${bookingData.preferredTime}\n\nBooking ID: ${bookingData.bookingId}`
        });

        console.log('ntfy notification sent:', {
            primary: ntfyResponse.status,
            backup: backupResponse.status,
            customer: bookingData.customerName,
            total: bookingData.totalCost
        });

        res.status(200).json({ 
            success: true, 
            message: 'Notification sent to ntfy',
            ntfyStatus: ntfyResponse.status,
            backupStatus: backupResponse.status,
            bookingId: bookingData.bookingId
        });

    } catch (error) {
        console.error('ntfy notification error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send notification',
            details: error.message 
        });
    }
}