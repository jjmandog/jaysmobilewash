/**
 * Price Calculator - Minimal Version
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log("Price Calculator initialized");
  
  const calculateBtn = document.getElementById('calculate-price-btn');
  const vehicleSize = document.getElementById('vehicle-size');
  const serviceType = document.getElementById('service-type');
  const priceResult = document.getElementById('price-result');
  const calculatedPrice = document.getElementById('calculated-price');
  
  // Base prices
  const prices = {
    sedan: {
      mini: 70,
      luxury: 130,
      max: 200,
      ceramic: 450
    },
    suv: {
      mini: 90,
      luxury: 150,
      max: 230,
      ceramic: 500
    },
    truck: {
      mini: 100,
      luxury: 170,
      max: 250,
      ceramic: 550
    }
  };
  
  // Handle calculate button click
  if (calculateBtn) {
    calculateBtn.addEventListener('click', function() {
      // Basic validation
      if (!vehicleSize || !vehicleSize.value) {
        showError('vehicle-size-error', 'Please select a vehicle size');
        return;
      } else {
        hideError('vehicle-size-error');
      }
      
      if (!serviceType || !serviceType.value) {
        showError('service-type-error', 'Please select a service type');
        return;
      } else {
        hideError('service-type-error');
      }
      
      // Calculate price
      let totalPrice = prices[vehicleSize.value][serviceType.value] || 0;
      
      // Add add-ons if selected
      const addons = document.querySelectorAll('input[name="add-ons"]:checked');
      addons.forEach(function(addon) {
        totalPrice += parseInt(addon.value) || 0;
      });
      
      // Display result
      if (calculatedPrice) calculatedPrice.textContent = '$' + totalPrice;
      if (priceResult) priceResult.style.display = 'block';
    });
  }
  
  function showError(id, message) {
    const errorElement = document.getElementById(id);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }
  
  function hideError(id) {
    const errorElement = document.getElementById(id);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }
  
  // Expose tracking function
  window.trackCalculatorBooking = function() {
    console.log("Calculator booking tracked");
    // In real implementation, this would track the event with analytics
  };
});
