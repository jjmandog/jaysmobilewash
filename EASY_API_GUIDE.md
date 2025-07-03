# Easy API Development Guide

## Quick Start - Adding New APIs to Your Database

Since you already have a full database setup, adding new APIs is straightforward. This guide shows you exactly how to add new API endpoints quickly and easily.

## 🚀 Quick API Creation Steps

### Step 1: Choose Your API Type

Pick one of these common patterns:

1. **Simple Data API** - Get/Post data (like customers, appointments)
2. **CRUD API** - Full Create/Read/Update/Delete (like the existing services API)
3. **Action API** - Perform specific actions (like send SMS, generate reports)
4. **Integration API** - Connect to external services

### Step 2: Use Our Templates

Copy the appropriate template from the `/api-templates/` folder (we'll create these):

```bash
# Copy template for your API type
cp api-templates/simple-data-api.js api/your-new-api.js
cp database/templates/simple-table.js database/your-table.js
```

### Step 3: Customize the Template

Edit the copied files to match your needs:

1. Replace table names
2. Update field names
3. Add your business logic
4. Test your API

## 📋 API Templates Available

### 1. Simple Data API
- **Use for**: Customer data, appointments, locations
- **Features**: Get all, Get by ID, Create new
- **Template**: `api-templates/simple-data-api.js`

### 2. Full CRUD API
- **Use for**: Complex data that needs all operations
- **Features**: Create, Read, Update, Delete + validation
- **Template**: `api-templates/crud-api.js`

### 3. Action API
- **Use for**: Sending emails, generating reports, processing payments
- **Features**: POST endpoints for specific actions
- **Template**: `api-templates/action-api.js`

### 4. Integration API
- **Use for**: Connecting to external services (Google Maps, payment processors)
- **Features**: Proxy external APIs with your database
- **Template**: `api-templates/integration-api.js`

## 🔧 Common API Examples

### Example 1: Customer API
```javascript
// GET /api/customers - Get all customers
// GET /api/customers?id=123 - Get specific customer
// POST /api/customers - Create new customer
```

### Example 2: Appointment API
```javascript
// GET /api/appointments - Get all appointments
// POST /api/appointments - Book new appointment
// PUT /api/appointments - Update appointment
// DELETE /api/appointments - Cancel appointment
```

### Example 3: SMS API
```javascript
// POST /api/send-sms - Send SMS to customer
// GET /api/sms-status - Check SMS delivery status
```

## 💡 Pro Tips

1. **Start Simple**: Begin with a basic GET endpoint, then add more features
2. **Copy Working Code**: Use the existing `/api/services.js` as a reference
3. **Test Early**: Test each endpoint as you build it
4. **Follow Patterns**: Keep the same structure as existing APIs

## 🛠️ Utilities Available

We provide utility functions to reduce repetitive code:

```javascript
import { createCRUDHandlers, validateInput, sendResponse } from '../utils/api-helpers.js';

// Create standard CRUD operations automatically
const handlers = createCRUDHandlers('customers', customerSchema);
```

## 📚 Real Examples

### Adding a Customer API

1. **Create the API file**: `api/customers.js`
2. **Create the database file**: `database/customers.js`
3. **Add to your database schema**: Update `database/connection.js`
4. **Test it**: Use the test templates

### Adding an Appointment API

1. **Create the API file**: `api/appointments.js`
2. **Create the database file**: `database/appointments.js`
3. **Add relationships**: Connect to customers and services
4. **Test it**: Create integration tests

## 🧪 Testing Your APIs

Each template includes test examples:

```bash
# Test your new API
npm test tests/your-new-api.test.js

# Test all APIs
npm run test:run
```

## 🔗 Next Steps

1. Choose your API type from the templates
2. Copy and customize the template
3. Update the database schema
4. Test your API
5. Add it to your frontend

## 📞 Need Help?

- Check the existing `/api/services.js` for working examples
- Look at `/database/services.js` for database patterns
- Review the tests in `/tests/services-api-integration.test.js`
- All templates include detailed comments and examples