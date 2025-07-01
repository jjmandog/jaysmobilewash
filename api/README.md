# Jay's Mobile Wash - Secure AI Chat API & SMS Notifications

## Setup Instructions

### Environment Variables

1. Copy `.env.example` to `.env.local`
2. Set your API keys and credentials:
   ```
   OPENROUTER_API_KEY=your_actual_openrouter_api_key_here
   GMAIL_USER=your_gmail_address@gmail.com
   GMAIL_APP_PASSWORD=your_gmail_app_password_here
   ```

**Important:** For Gmail SMS functionality:
- Use Gmail App Password, not your regular password
- Generate App Password at: https://support.google.com/accounts/answer/185833
- Enable 2-Factor Authentication on your Gmail account first

### Deployment

#### Vercel
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `OPENROUTER_API_KEY`
   - `GMAIL_USER` 
   - `GMAIL_APP_PASSWORD`
3. Deploy

#### Netlify
1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard:
   - `OPENROUTER_API_KEY`
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
3. Deploy

### API Endpoints

#### AI Chat Endpoint
- **URL**: `/api/ai`
- **Method**: POST
- **Content-Type**: application/json
- **Body**: 
  ```json
  {
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "max_tokens": 500,
    "temperature": 0.7
  }
  ```

#### SMS Booking Notifications
- **URL**: `/api/send-sms`
- **Method**: POST
- **Content-Type**: application/json
- **CORS**: Enabled for SPA compatibility
- **Body**:
  ```json
  {
    "name": "John Doe",
    "phone": "555-123-4567", 
    "service": "Jay's Luxury Detail",
    "date": "2025-01-15",
    "time": "10:00 AM",
    "notes": "Please call before arriving"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "SMS notification sent successfully",
    "messageLength": 114
  }
  ```
- **Features**:
  - Sends SMS via Gmail to Verizon gateway (5622289429@vtext.com)
  - Automatically trims messages to 160 characters
  - Comprehensive input validation
  - Error handling for authentication and connection issues
  - Bot/crawler protection

### Security Features

- API keys never exposed to client
- Blocks known bot/crawler user agents  
- Only accepts POST requests
- Validates environment configuration
- CORS headers for SPA compatibility
- Input validation and sanitization

### Files

- `api/ai.js` - Secure AI chat serverless function
- `api/send-sms.js` - SMS notification serverless function
- `enhanced_chat_widget.html` - Complete chat widget implementation
- `openrouter-api-fix.js` - Updated to use secure endpoint