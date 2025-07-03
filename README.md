# Jay's Mobile Wash - Website

## About
This repository contains the website code for Jay's Mobile Wash, a premium mobile car detailing service operating in Los Angeles County and Orange County.

## Features
- Responsive design optimized for all devices
- PWA (Progressive Web App) functionality for mobile app-like experience
- Structured data for rich results in search engines
- Voice search optimization
- Local SEO implementation
- Accessibility features

## Technologies Used
- HTML5
- CSS3 with TailwindCSS
- JavaScript
- Progressive Web App (PWA) technologies
- Service Workers for offline functionality

## SEO Implementations
- Schema.org structured data
- Local business markup
- Voice search optimization
- Geo targeting with KML
- XML sitemaps
- Optimized robots.txt
- Accessibility enhancements

## Local Development
1. Clone the repository
2. Navigate to the project directory
3. Open index.html in your browser

For live server functionality:
- Use VS Code with Live Server extension
- Run `npx serve` from the project directory

## File Structure
- `index.html` - Main website file
- `manifest.json` - PWA manifest
- `service-worker.js` - Service worker for offline functionality
- `robots.txt` - Search engine directives
- `sitemap.xml` - Main sitemap index
- Various sitemap files - Specialized content sitemaps
- `geo.kml` - Geographical targeting for map pack results
- `.htaccess` - Apache server configurations

## API Endpoints

### Chatbot API
- **OpenAI API** (`/api/openai`) - Handles AI chat functionality
- **SMS API** (`/api/send-sms`) - Handles SMS notifications

Both APIs:
- Only accept POST requests for main functionality
- Support OPTIONS requests for CORS preflight
- Set proper CORS headers for all responses
- Return 405 errors for unsupported HTTP methods

### Troubleshooting API Issues

#### 405 Method Not Allowed Errors
If you're seeing 405 errors when using the APIs:

1. **Ensure you're using POST requests** for actual API calls:
   ```javascript
   fetch('/api/openai', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       prompt: 'Your message here'
     })
   })
   ```

2. **CORS Issues**: The APIs support CORS and handle OPTIONS preflight requests automatically. If you're still seeing CORS errors:
   - Check that your frontend is sending proper `Content-Type: application/json` headers
   - Verify you're making requests to the correct endpoints
   - For development, the APIs allow all origins (`*`)

3. **Common deployment issues**:
   - **Vercel**: Ensure API files are in the `/api` directory
   - **Netlify**: Configure Functions in `netlify.toml` to point to API files
   - **Other platforms**: Check that your platform supports serverless functions

4. **Method validation**: 
   - Only POST and OPTIONS methods are supported
   - GET, PUT, DELETE, PATCH will return 405 errors by design

#### API Request Format
**OpenAI API** (`/api/openai`):
```json
{
  "prompt": "Your message here",
  "role": "chat" // optional, defaults to "chat"
}
```

**SMS API** (`/api/send-sms`):
```json
{
  "to": "recipient@example.com",
  "text": "Your message here",
  "from": "sender@example.com", // optional
  "subject": "Subject line" // optional
}
```

## License
© 2025 Jay's Mobile Wash. All rights reserved.