/**
 * Test ntfy Webhook Integration
 * Verifies that ntfy.sh notifications are working correctly
 */

async function testNtfyIntegration() {
    console.log('🧪 Testing ntfy Webhook Integration...\n');

    // Test 1: Direct ntfy.sh connectivity
    console.log('Test 1: Testing direct ntfy.sh connection...');
    try {
        const testResponse = await fetch('https://ntfy.sh/jays-wash-alerts-2025', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Title': 'Test Alert - Jays Mobile Wash',
                'Priority': 'default',
                'Tags': 'test,verification'
            },
            body: 'ntfy webhook test successful! If you see this notification on your phone, the webhook is working correctly.'
        });

        if (testResponse.ok) {
            console.log('✅ Primary topic (jays-wash-alerts-2025): SUCCESS');
        } else {
            console.error('❌ Primary topic FAILED:', testResponse.status);
        }
    } catch (error) {
        console.error('❌ Primary topic ERROR:', error.message);
    }

    // Test 2: Backup topic
    console.log('\nTest 2: Testing backup topic...');
    try {
        const backupResponse = await fetch('https://ntfy.sh/jays-wash-alerts-backup', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Title': 'Backup Test',
                'Priority': '3',
                'Tags': 'test'
            },
            body: 'Backup topic is working!'
        });

        if (backupResponse.ok) {
            console.log('✅ Backup topic (jays-wash-alerts-backup): SUCCESS');
        } else {
            console.error('❌ Backup topic FAILED:', backupResponse.status);
        }
    } catch (error) {
        console.error('❌ Backup topic ERROR:', error.message);
    }

    // Test 3: Simulate booking notification
    console.log('\nTest 3: Testing full booking notification format...');
    try {
        const mockBookingData = {
            customerName: 'Test Customer',
            customerPhone: '(555) 123-4567',
            customerEmail: 'test@example.com',
            address: '123 Test St, Los Angeles, CA 90001',
            packageType: 'Premium Detail',
            carType: 'Sedan',
            customServices: 'Engine Cleaning, Headlight Restoration',
            totalCost: '299',
            preferredDate: '2025-11-15',
            preferredTime: '10:00 AM',
            photoCount: 3,
            specialInstructions: 'Test booking - please ignore',
            bookingId: 'TEST-' + Date.now()
        };

        const message = `🚗 NEW BOOKING REQUEST (TEST)

👤 Customer: ${mockBookingData.customerName}
📱 Phone: ${mockBookingData.customerPhone}
📧 Email: ${mockBookingData.customerEmail}
🏠 Address: ${mockBookingData.address}

🚙 Service: ${mockBookingData.packageType}
🚗 Car Type: ${mockBookingData.carType}
➕ Add-ons: ${mockBookingData.customServices}
💰 TOTAL: $${mockBookingData.totalCost}

📅 Date: ${mockBookingData.preferredDate}
🕐 Time: ${mockBookingData.preferredTime}
📸 Photos: ${mockBookingData.photoCount} uploaded
📝 Notes: ${mockBookingData.specialInstructions}

🆔 Booking ID: ${mockBookingData.bookingId}

⚡ THIS IS A TEST - NO ACTION NEEDED`;

        const fullTestResponse = await fetch('https://ntfy.sh/jays-wash-alerts-2025', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Title': `TEST BOOKING: ${mockBookingData.customerName}`,
                'Priority': 'high',
                'Tags': 'car,booking,test'
            },
            body: message
        });

        if (fullTestResponse.ok) {
            console.log('✅ Full booking notification format: SUCCESS');
            console.log(`📱 Check your ntfy app for test notification`);
        } else {
            console.error('❌ Full booking notification FAILED:', fullTestResponse.status);
        }
    } catch (error) {
        console.error('❌ Full booking notification ERROR:', error.message);
    }

    console.log('\n✅ ntfy Webhook Integration Test Complete!');
    console.log('\n📱 Check your phone\'s ntfy app to verify you received all notifications.');
    console.log('   If you see notifications, the webhook is working correctly!');
}

// Run the test
testNtfyIntegration();
