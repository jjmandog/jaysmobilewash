# Global Pricing Configuration System

## Overview
The pricing page now includes a global configuration system that allows admin changes to be saved for all users, not just locally.

## 🔐 Admin Access
- **Password**: `piepie`
- **Session Duration**: 30 minutes with auto-logout
- **Access**: Click the gear icon (⚙️) on the pricing page

## 🌍 Global vs Local Saves

### **Global Saves (Admin Mode)**
- ✅ **When logged in as admin**: All changes are saved globally via API
- ✅ **Affects all users**: Changes apply to everyone visiting the site
- ✅ **Server backup**: Configuration stored on server
- ✅ **Fallback protection**: If server fails, uses local backup

### **Local Saves (Guest Mode)**
- 📱 **Without admin login**: Changes saved only in browser localStorage
- 📱 **Personal only**: Only affects the current browser/device
- 📱 **Temporary**: May be lost if browser data is cleared

## 🛠 Technical Implementation

### API Endpoint
```
POST/GET /api/pricing-config
```

### Backend Features
- **Authentication**: Requires admin password for writes
- **Persistence**: Saves to `pricing-data.json` on server
- **Validation**: Validates configuration structure
- **Metadata**: Tracks last update time and admin user

### Frontend Features
- **Auto-loading**: Loads latest global config on page load
- **Fallback**: Falls back to localStorage if server unavailable
- **Session management**: 30-minute admin sessions with countdown
- **Real-time feedback**: Shows global save status with notifications

## 📊 Configuration Structure
```json
{
  "basePrices": {
    "mini": { "name": "Mini Detail", "price": 70, "description": "..." },
    "luxury": { "name": "Luxury Detail", "price": 130, "description": "..." },
    "max": { "name": "Max Detail", "price": 200, "description": "..." }
  },
  "serviceLevels": {
    "not-included": { "name": "Not Included", "price": 0, "color": "#ef4444" },
    "basic-clean": { "name": "Basic Clean", "price": 0, "color": "#22c55e" },
    // ... more levels
  },
  "partMultipliers": {
    "hood": 1.0,
    "roof": 1.0,
    // ... more parts
  },
  "lastUpdated": "2025-07-10T...",
  "updatedBy": "admin"
}
```

## 🚀 Deployment
The system works with Vercel's serverless functions:

1. **API Function**: `/api/pricing-config.js`
2. **Configuration**: `vercel.json` includes API routes
3. **Data Storage**: `pricing-data.json` (created automatically)

## 🔄 How It Works

### For Regular Users
1. Visit pricing page
2. System loads latest global configuration
3. Can interact with pricing but changes are local only

### For Admins
1. Click gear icon and enter password: `piepie`
2. Make changes to pricing/colors/services
3. Click "Save All Changes"
4. Changes are saved globally for all users
5. Green notifications confirm global saves
6. Session automatically expires after 30 minutes

## 🛡 Security Features
- **Password protection**: Only admin can make global changes
- **Session timeout**: Automatic logout after 30 minutes
- **Local fallback**: System works offline with local storage
- **Input validation**: Server validates all configuration data
- **Error handling**: Graceful degradation if server unavailable

## 📱 User Experience
- **Loading indicators**: Shows when loading/saving global config
- **Status displays**: Clear indication of admin status
- **Session timer**: Live countdown of remaining admin time
- **Notifications**: Success/error messages for all operations
- **Fallback graceful**: Works even if server is down

## 🎯 Benefits
1. **Centralized control**: Admin can update pricing for all users
2. **No code deployment**: Changes apply without redeploying site
3. **Backup redundancy**: Multiple layers of data protection
4. **User-friendly**: Simple password-based admin access
5. **Performance**: Loads from server but caches locally
