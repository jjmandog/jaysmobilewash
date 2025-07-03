/**
 * Quotes API - Generate service quotes for Jay's Mobile Wash
 * This API demonstrates the new plug-and-play pattern
 */

// CORS headers for local development and production
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * API Metadata - Automatically discovered by the API Registry
 */
export const metadata = {
  name: 'Service Quotes API',
  description: 'Generate detailed quotes for mobile car wash services',
  version: '1.0.0',
  
  categories: ['quotes', 'pricing', 'services'],
  keywords: ['quote', 'price', 'cost', 'estimate', 'service', 'detail', 'wash', 'ceramic', 'coating'],
  
  enabled: true,
  endpoint: '/api/quotes',
  methods: ['GET', 'POST'],
  
  input: {
    type: 'object',
    properties: {
      service: { type: 'string', description: 'Type of service requested' },
      vehicleType: { type: 'string', description: 'Type of vehicle (car, truck, SUV, etc.)' },
      addOns: { type: 'array', description: 'Additional services requested' },
      location: { type: 'string', description: 'Service location' }
    }
  },
  
  output: {
    type: 'object',
    properties: {
      quote: { type: 'object', description: 'Detailed quote information' },
      services: { type: 'array', description: 'List of services included' },
      total: { type: 'number', description: 'Total price' }
    }
  },
  
  examples: [
    {
      name: 'Basic car wash quote',
      input: { service: 'basic wash', vehicleType: 'car' },
      description: 'Get a quote for basic car wash service'
    },
    {
      name: 'Full detail with ceramic coating',
      input: { 
        service: 'full detail', 
        vehicleType: 'SUV',
        addOns: ['ceramic coating', 'interior protection']
      },
      description: 'Comprehensive service quote with add-ons'
    }
  ],
  
  shouldHandle: (input, context) => {
    const text = typeof input === 'string' ? input : input.service || input.message || '';
    const quoteKeywords = ['quote', 'price', 'cost', 'how much', 'estimate', 'pricing'];
    return quoteKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }
};

// Service pricing data
const SERVICE_PRICES = {
  'basic wash': { base: 50, car: 0, truck: 15, suv: 10, van: 15 },
  'full detail': { base: 120, car: 0, truck: 30, suv: 20, van: 25 },
  'ceramic coating': { base: 400, car: 0, truck: 100, suv: 50, van: 75 },
  'interior detail': { base: 80, car: 0, truck: 20, suv: 15, van: 20 },
  'exterior detail': { base: 70, car: 0, truck: 15, suv: 10, van: 15 }
};

const ADD_ON_PRICES = {
  'interior protection': 50,
  'tire shine': 20,
  'engine cleaning': 40,
  'headlight restoration': 60,
  'scratch removal': 80
};

/**
 * Main API handler
 */
async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).json({});
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        return res.status(405).json({
          error: 'Method not allowed',
          message: `Method ${req.method} is not supported`
        });
    }
  } catch (error) {
    console.error('Quotes API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
}

/**
 * Handle GET requests - Return service information
 */
async function handleGet(req, res) {
  return res.status(200).json({
    ...metadata,
    availableServices: Object.keys(SERVICE_PRICES),
    availableAddOns: Object.keys(ADD_ON_PRICES),
    vehicleTypes: ['car', 'truck', 'suv', 'van'],
    status: 'active',
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle POST requests - Generate quotes
 */
async function handlePost(req, res) {
  try {
    const { service, vehicleType = 'car', addOns = [], location } = req.body;
    
    // Validate input
    if (!service) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'service is required'
      });
    }
    
    // Generate quote
    const quote = await generateQuote(service, vehicleType, addOns, location);
    
    return res.status(200).json({
      quote,
      metadata: {
        api: metadata.name,
        timestamp: new Date().toISOString(),
        categories: metadata.categories
      }
    });
  } catch (error) {
    console.error('Error generating quote:', error);
    return res.status(500).json({
      error: 'Processing Error',
      message: 'Failed to generate quote'
    });
  }
}

/**
 * Generate a detailed service quote
 */
async function generateQuote(service, vehicleType, addOns, location) {
  const serviceKey = service.toLowerCase();
  const vehicleKey = vehicleType.toLowerCase();
  
  // Find matching service
  const serviceData = SERVICE_PRICES[serviceKey];
  if (!serviceData) {
    // Try partial matching
    const matchedService = Object.keys(SERVICE_PRICES).find(s => 
      s.includes(serviceKey) || serviceKey.includes(s)
    );
    if (matchedService) {
      serviceData = SERVICE_PRICES[matchedService];
    }
  }
  
  if (!serviceData) {
    throw new Error(`Service '${service}' not found`);
  }
  
  // Calculate base price
  let basePrice = serviceData.base;
  let vehicleUpcharge = serviceData[vehicleKey] || 0;
  
  // Calculate add-ons
  let addOnTotal = 0;
  const includedAddOns = [];
  
  for (const addOn of addOns) {
    const addOnKey = addOn.toLowerCase();
    const price = ADD_ON_PRICES[addOnKey];
    if (price) {
      addOnTotal += price;
      includedAddOns.push({
        name: addOn,
        price: price
      });
    }
  }
  
  // Calculate total
  const subtotal = basePrice + vehicleUpcharge + addOnTotal;
  const tax = subtotal * 0.0875; // 8.75% tax
  const total = subtotal + tax;
  
  // Generate quote object
  const quote = {
    id: `quote-${Date.now()}`,
    service: service,
    vehicleType: vehicleType,
    location: location,
    breakdown: {
      baseService: {
        name: service,
        price: basePrice
      },
      vehicleUpcharge: vehicleUpcharge,
      addOns: includedAddOns,
      subtotal: subtotal,
      tax: tax,
      total: total
    },
    validity: '30 days',
    notes: [
      'Price includes all materials and labor',
      'Service performed at your location',
      'Satisfaction guaranteed',
      location && `Service area: ${location}`
    ].filter(Boolean),
    estimatedDuration: getEstimatedDuration(service, addOns.length),
    contact: {
      phone: '(555) 123-4567',
      email: 'quotes@jaysmobilewash.com'
    }
  };
  
  return quote;
}

/**
 * Estimate service duration
 */
function getEstimatedDuration(service, addOnCount) {
  const baseDurations = {
    'basic wash': 60,
    'full detail': 180,
    'ceramic coating': 240,
    'interior detail': 120,
    'exterior detail': 90
  };
  
  const baseTime = baseDurations[service.toLowerCase()] || 90;
  const addOnTime = addOnCount * 30; // 30 minutes per add-on
  
  return `${baseTime + addOnTime} minutes`;
}

export default handler;