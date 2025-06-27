/**
 * Price Calculator for Jay's Mobile Wash
 * Error-free implementation with fallbacks and analytics
 */

// Optimized Price Calculator with Error Prevention
function initPriceCalculator() {
  // Elements cache for performance
  const elements = {
    form: document.getElementById('price-calculator-form'),
    vehicleSize: document.getElementById('vehicle-size'),
    serviceType: document.getElementById('service-type'),
    vehicleSizeError: document.getElementById('vehicle-size-error'),
    serviceTypeError: document.getElementById('service-type-error'),
    calculateButton: document.getElementById('calculate-price-btn'),
    resultContainer: document.getElementById('price-result'),
    calculatedPrice: document.getElementById('calculated-price')
  };
  
  // Verify all elements exist to prevent 404/null errors
  if (!elements.form || !elements.calculateButton) return;
  
  // Base prices - defined outside function for better memory management
  const basePrices = {
    'sedan': {
      'mini': 70,
      'luxury': 130,
      'max': 200,
      'ceramic': 450
    },
    'suv': {
      'mini': 90,
      'luxury': 160,
      'max': 240,
      'ceramic': 550
    },
    'truck': {
      'mini': 100,
      'luxury': 180,
      'max': 260,
      'ceramic': 600
    }
  };
  
  // Error handler function
  function showError(element, errorElement, message) {
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = message ? 'block' : 'none';
    }
    if (element) {
      if (message) {
        element.setAttribute('aria-invalid', 'true');
        element.classList.add('error');
      } else {
        element.removeAttribute('aria-invalid');
        element.classList.remove('error');
      }
    }
    return !!message; // Return true if there's an error
  }
  
  // Validate inputs
  function validateInputs() {
    let hasError = false;
    
    // Validate vehicle size
    if (elements.vehicleSize && !elements.vehicleSize.value) {
      hasError = showError(elements.vehicleSize, elements.vehicleSizeError, 'Please select a vehicle size') || hasError;
    } else {
      showError(elements.vehicleSize, elements.vehicleSizeError, '');
    }
    
    // Validate service type
    if (elements.serviceType && !elements.serviceType.value) {
      hasError = showError(elements.serviceType, elements.serviceTypeError, 'Please select a service type') || hasError;
    } else {
      showError(elements.serviceType, elements.serviceTypeError, '');
    }
    
    return !hasError;
  }
  
  // Handle calculation
  function calculatePrice() {
    // Validate inputs first
    if (!validateInputs()) return;
    
    try {
      const vehicleSize = elements.vehicleSize.value;
      const serviceType = elements.serviceType.value;
      
      // Safely get add-ons with error handling
      let addOns = 0;
      try {
        addOns = Array.from(document.querySelectorAll('input[name="add-ons"]:checked'))
          .map(input => parseInt(input.value) || 0)
          .reduce((sum, value) => sum + value, 0);
      } catch (e) {
        console.error('Error calculating add-ons:', e);
        // Continue with addOns = 0
      }
      
      // Safely calculate base price with fallbacks
      let basePrice = 0;
      if (basePrices[vehicleSize] && basePrices[vehicleSize][serviceType]) {
        basePrice = basePrices[vehicleSize][serviceType];
      } else {
        // Fallback to default pricing if data is missing
        basePrice = 100; 
        console.error('Missing price data for', vehicleSize, serviceType);
      }
      
      const totalPrice = basePrice + addOns;
      
      // Update UI safely
      if (elements.calculatedPrice) {
        elements.calculatedPrice.textContent = `$${totalPrice}`;
      }
      
      if (elements.resultContainer) {
        elements.resultContainer.style.display = 'block';
      }
      
      // Track calculation for analytics
      trackCalculation(vehicleSize, serviceType, addOns, totalPrice);
      
    } catch (error) {
      console.error('Error in price calculation:', error);
      // Show graceful error to user
      if (elements.calculatedPrice) {
        elements.calculatedPrice.textContent = 'Please call for pricing';
      }
    }
  }
  
  // Analytics tracking with error handling
  function trackCalculation(vehicleSize, serviceType, addOns, totalPrice) {
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'price_calculation', {
          'vehicle_size': vehicleSize,
          'service_type': serviceType,
          'add_ons_total': addOns,
          'total_price': totalPrice
        });
      }
    } catch (e) {
      console.error('Analytics tracking error:', e);
      // Non-critical error, don't disrupt user experience
    }
  }
  
  // Expose booking tracking function globally
  window.trackCalculatorBooking = function() {
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'calculator_booking_click', {
          'event_category': 'conversion',
          'estimated_value': elements.calculatedPrice ? 
            parseFloat(elements.calculatedPrice.textContent.replace('$', '')) : 0
        });
      }
    } catch (e) {
      console.error('Booking tracking error:', e);
    }
  };
  
  // Event listeners
  if (elements.calculateButton) {
    elements.calculateButton.addEventListener('click', calculatePrice);
  }
  
  // Add input validation on change
  if (elements.vehicleSize) {
    elements.vehicleSize.addEventListener('change', function() {
      showError(elements.vehicleSize, elements.vehicleSizeError, 
        this.value ? '' : 'Please select a vehicle size');
    });
  }
  
  if (elements.serviceType) {
    elements.serviceType.addEventListener('change', function() {
      showError(elements.serviceType, elements.serviceTypeError, 
        this.value ? '' : 'Please select a service type');
    });
  }
}

// Call this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', initPriceCalculator);
