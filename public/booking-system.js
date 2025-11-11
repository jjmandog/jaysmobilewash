/**
 * Jay's Mobile Wash - Advanced Booking System v2.1
 * Last updated: November 2025
 * Interactive booking form with package selection and custom services
 */

// Booking form state management
let bookingState = {
    step: 1,
    packageType: '',
    customServices: [],
    customerData: {},
    carPhotos: [], // Store uploaded car photos
    isSubmitting: false
};

// Service packages and their prices
const PACKAGES = {
    'mini-detail': {
        name: "Jay's Mini Detail",
        price: 70,
        description: '2-Step Hand Contact Wash, Interior Wipe-Down & Shine, Deep Vacuuming, Ceramic SiO₂ Rim Cleaning',
        duration: '1 hour'
    },
    'luxury-detail': {
        name: "Jay's Luxury Detail",
        price: 130,
        description: 'Everything in Mini Detail PLUS Ceramic Spray Wax/Sealant, SiO₂ Interior Cleanser, Vinyl Restoration',
        duration: '2 hours'
    },
    'max-detail': {
        name: "Jay's Max Detail",
        price: 200,
        description: 'Everything in Luxury PLUS Ceramic Hyper Wax/Sealant, Interior Steam Cleaning, Clay Bar Treatment',
        duration: '3 hours'
    }
};

// Individual services for custom packages
const SERVICES = {
    'exterior-wash': { name: 'Exterior Wash', price: 25, category: 'Exterior' },
    'interior-vacuum': { name: 'Interior Vacuum', price: 15, category: 'Interior' },
    'interior-detail': { name: 'Interior Detail', price: 35, category: 'Interior' },
    'steam-clean': { name: 'Steam Clean Interior', price: 40, category: 'Interior' },
    'shampoo-extraction': { name: 'Shampoo Extraction', price: 100, category: 'Interior' },
    'headlight-restoration': { name: 'Ceramic Headlight Restoration (2yr warranty)', price: 30, category: 'Exterior' },
    'polish-car': { name: 'Polish (Car)', price: 160, category: 'Exterior' },
    'polish-suv': { name: 'Polish (SUV)', price: 180, category: 'Exterior' },
    'scratch-removal': { name: 'Scratch Removal ($20 per scratch, varies by size)', price: 20, category: 'Exterior' },
    'wax-spray': { name: 'Spray Wax', price: 20, category: 'Protection' },
    'ceramic-hand-applied': { name: 'Hand Applied Ceramic Base', price: 40, category: 'Protection' },
    'ceramic-foam-sealant': { name: 'Ceramic Foam Sealant', price: 60, category: 'Protection' },
    'clay-bar': { name: 'Clay Bar Treatment', price: 40, category: 'Exterior' },
    'deiron-rims': { name: 'DeIron Rims', price: 25, category: 'Exterior' },
    'engine-bay': { name: 'Engine Bay Cleaning (All by Hand)', price: 50, category: 'Engine' },
    'odor-elimination': { name: 'Odor Elimination', price: 30, category: 'Interior' },
    'leather-condition': { name: 'Leather Conditioning', price: 10, category: 'Interior' },
    'vinyl-shine': { name: 'Vinyl Interior Shine', price: 10, category: 'Interior' }
};

/**
 * Initialize booking system
 */
function initBookingSystem() {
    // Add booking button to all relevant pages
    addBookNowButtons();

    // Create booking modal HTML
    createBookingModal();

    // Add event listeners
    setupBookingEventListeners();
}

/**
 * Add Book Now buttons throughout the site
 */
function addBookNowButtons() {
    // Find suitable locations for Book Now buttons
    const locations = [
        { selector: '.hero-section', position: 'append' },
        { selector: '.pricing-section', position: 'prepend' },
        { selector: '.services-section', position: 'append' },
        { selector: 'header nav', position: 'append' }
    ];

    locations.forEach(location => {
        const container = document.querySelector(location.selector);
        if (container) {
            const button = createBookNowButton();
            if (location.position === 'append') {
                container.appendChild(button);
            } else {
                container.insertBefore(button, container.firstChild);
            }
        }
    });

    // Add floating book now button
    addFloatingBookButton();
}

/**
 * Create Book Now button element
 */
function createBookNowButton(variant = 'primary') {
    const button = document.createElement('button');
    button.className = getBookButtonClasses(variant);
    button.innerHTML = `
        <i class="fas fa-calendar-plus mr-2"></i>
        Book Now - Free Quote
    `;
    button.onclick = openBookingModal;
    return button;
}

/**
 * Get appropriate CSS classes for Book Now button
 */
function getBookButtonClasses(variant = 'primary') {
    const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50';

    if (variant === 'floating') {
        return `${baseClasses} fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl hover:shadow-purple-500/25 animate-pulse`;
    }

    return `${baseClasses} bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 glow-effect`;
}

/**
 * Add floating Book Now button
 */
function addFloatingBookButton() {
    const floatingButton = createBookNowButton('floating');
    document.body.appendChild(floatingButton);
}

/**
 * Create booking modal HTML structure
 */
function createBookingModal() {
    const modalHTML = `
        <div id="booking-modal" class="fixed inset-0 z-50 hidden overflow-y-auto bg-black/80 backdrop-blur-sm">
            <div class="flex min-h-screen items-center justify-center p-4">
                <div class="bg-gray-900 border border-purple-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <!-- Modal Header -->
                    <div class="flex items-center justify-between p-6 border-b border-purple-500/30">
                        <div>
                            <h2 class="text-2xl font-bold text-white glow-text">Book Your Appointment</h2>
                            <p class="text-purple-300 mt-1">Jay's Mobile Wash - We Come To You!</p>
                        </div>
                        <button id="close-booking" class="text-gray-400 hover:text-white transition-colors p-2">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <!-- Progress Indicator -->
                    <div class="px-6 py-4 border-b border-purple-500/30">
                        <div class="flex items-center justify-between">
                            <div class="step-indicator active" data-step="1">
                                <div class="step-circle">1</div>
                                <span>Service</span>
                            </div>
                            <div class="step-indicator" data-step="2">
                                <div class="step-circle">2</div>
                                <span>Details</span>
                            </div>
                            <div class="step-indicator" data-step="3">
                                <div class="step-circle">3</div>
                                <span>Confirm</span>
                            </div>
                        </div>
                    </div>

                    <!-- Modal Content -->
                    <div id="booking-content" class="p-6">
                        ${getStep1HTML()}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Step 1: Service Selection
 */
function getStep1HTML() {
    return `
        <div class="step-content" data-step="1">
            <h3 class="text-xl font-bold text-white mb-6">Choose Your Service</h3>

            <!-- Package Selection -->
            <div class="mb-8">
                <h4 class="text-lg font-semibold text-purple-300 mb-4">Popular Packages</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${Object.entries(PACKAGES).map(([key, package]) => `
                        <div class="package-option p-4 border border-purple-500/30 rounded-lg cursor-pointer hover:border-purple-400 transition-colors" data-package="${key}">
                            <div class="flex justify-between items-start mb-2">
                                <h5 class="font-semibold text-white">${package.name}</h5>
                                <span class="text-green-400 font-bold">$${package.price}</span>
                            </div>
                            <p class="text-gray-300 text-sm mb-2">${package.description}</p>
                            <div class="flex justify-between text-xs text-purple-300">
                                <span><i class="fas fa-clock mr-1"></i>${package.duration}</span>
                                <span><i class="fas fa-star mr-1"></i>Popular</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Custom Package Option -->
            <div class="mb-8">
                <div class="package-option p-4 border border-purple-500/30 rounded-lg cursor-pointer hover:border-purple-400 transition-colors" data-package="custom">
                    <div class="flex justify-between items-center">
                        <div>
                            <h5 class="font-semibold text-white">Custom Package</h5>
                            <p class="text-gray-300 text-sm">Choose individual services</p>
                        </div>
                        <i class="fas fa-cog text-purple-400 text-xl"></i>
                    </div>
                </div>
            </div>

            <!-- Custom Services (Hidden by default) -->
            <div id="custom-services" class="hidden mb-8">
                <h4 class="text-lg font-semibold text-purple-300 mb-4">Select Services</h4>
                ${renderCustomServices()}
                <div class="mt-4 p-4 bg-purple-900/30 rounded-lg">
                    <div class="flex justify-between items-center">
                        <span class="text-white font-semibold">Total:</span>
                        <span id="custom-total" class="text-green-400 font-bold text-xl">$0</span>
                    </div>
                </div>
            </div>

            <!-- Car Type Selection -->
            <div class="mb-8">
                <h4 class="text-lg font-semibold text-purple-300 mb-4">Vehicle Type</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div class="grid grid-cols-3 gap-3">
                    ${['Sedan', 'SUV', 'Other'].map(type => `
                        <div class="car-type-option p-3 border border-purple-500/30 rounded-lg cursor-pointer hover:border-purple-400 transition-colors text-center" data-car-type="${type.toLowerCase()}">
                            <i class="fas fa-car text-purple-400 mb-2"></i>
                            <div class="text-white text-sm">${type}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="flex justify-end">
                <button id="step1-next" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Continue <i class="fas fa-arrow-right ml-2"></i>
                </button>
            </div>
        </div>
    `;
}

/**
 * Render custom services by category
 */
function renderCustomServices() {
    const categories = [...new Set(Object.values(SERVICES).map(s => s.category))];

    return categories.map(category => `
        <div class="mb-6">
            <h5 class="font-semibold text-white mb-3">${category} Services</h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${Object.entries(SERVICES)
                    .filter(([key, service]) => service.category === category)
                    .map(([key, service]) => `
                        <label class="custom-service-item flex items-center p-3 border border-purple-500/30 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                            <input type="checkbox" class="service-checkbox hidden" data-service="${key}" data-price="${service.price}">
                            <div class="checkbox-custom mr-3"></div>
                            <div class="flex-1">
                                <div class="text-white font-medium">${service.name}</div>
                                <div class="text-green-400 font-semibold">$${service.price}</div>
                            </div>
                        </label>
                    `).join('')}
            </div>
        </div>
    `).join('');
}

/**
 * Step 2: Customer Details
 */
function getStep2HTML() {
    return `
        <div class="step-content" data-step="2">
            <h3 class="text-xl font-bold text-white mb-6">Your Information</h3>

            <form id="customer-details-form" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-purple-300 font-medium mb-2">Full Name *</label>
                        <input type="text" name="customerName" required class="w-full p-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:outline-none" placeholder="Your full name" autocomplete="name">
                    </div>
                    <div>
                        <label class="block text-purple-300 font-medium mb-2">Phone Number *</label>
                        <input type="tel" name="customerPhone" required class="w-full p-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:outline-none" placeholder="(555) 123-4567" autocomplete="tel">
                    </div>
                </div>

                <div>
                    <label class="block text-purple-300 font-medium mb-2">Email Address *</label>
                    <input type="email" name="customerEmail" required class="w-full p-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:outline-none" placeholder="your.email@example.com" autocomplete="email">
                </div>

                <div>
                    <label class="block text-purple-300 font-medium mb-2">Service Address *</label>
                    <div class="space-y-3">
                        <input type="text" name="streetAddress" required class="w-full p-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:outline-none" placeholder="Street address (e.g., 123 Main St, Apt 4B)" autocomplete="street-address" id="street-address-input">
                        <div class="grid grid-cols-2 gap-3">
                            <input type="text" name="city" required class="w-full p-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:outline-none" placeholder="City" autocomplete="address-level2" id="city-input">
                            <input type="text" name="zipCode" required class="w-full p-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:outline-none" placeholder="ZIP Code" autocomplete="postal-code" id="zip-input">
                        </div>
                    </div>
                    <div class="mt-2 text-xs text-gray-400">
                        📍 Address will be validated and shown on map for accurate directions
                    </div>
                    <!-- Map preview container -->
                    <div id="address-map-preview" class="hidden mt-3 h-48 bg-gray-800 rounded-lg border border-purple-500/30 relative overflow-hidden">
                        <div class="absolute inset-0 flex items-center justify-center text-white">
                            <div class="text-center">
                                <i class="fas fa-map-marker-alt text-2xl text-green-400 mb-2"></i>
                                <p class="font-medium">Address Location Preview</p>
                                <p id="validated-address" class="text-sm text-gray-300 mt-1"></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-purple-300 font-medium mb-2">Preferred Date</label>
                        <input type="date" name="preferredDate" class="w-full p-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:outline-none" min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div>
                        <label class="block text-purple-300 font-medium mb-2">Preferred Time</label>
                        <select name="preferredTime" class="w-full p-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:outline-none">
                            <option value="">Select time</option>
                            <option value="7:00 AM">7:00 AM</option>
                            <option value="8:00 AM">8:00 AM</option>
                            <option value="9:00 AM">9:00 AM</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="11:00 AM">11:00 AM</option>
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="1:00 PM">1:00 PM</option>
                            <option value="2:00 PM">2:00 PM</option>
                            <option value="3:00 PM">3:00 PM</option>
                            <option value="4:00 PM">4:00 PM</option>
                            <option value="5:00 PM">5:00 PM</option>
                            <option value="6:00 PM">6:00 PM</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-purple-300 font-medium mb-2">Special Instructions</label>
                    <textarea name="specialInstructions" rows="3" class="w-full p-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:outline-none" placeholder="Any special requests or instructions for our team..."></textarea>
                </div>

                <!-- Car Photos Upload Section -->
                <div class="mt-8">
                    <h4 class="text-lg font-semibold text-purple-300 mb-4">
                        <i class="fas fa-camera mr-2"></i>Car Photos (Optional)
                    </h4>
                    <p class="text-gray-400 text-sm mb-4">
                        Upload photos of your car to help us provide a more accurate quote and prepare the right equipment.
                    </p>

                    <!-- Photo Upload Area -->
                    <div id="photo-upload-area" class="border-2 border-dashed border-purple-500/30 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer">
                        <div id="upload-prompt">
                            <i class="fas fa-cloud-upload-alt text-4xl text-purple-400 mb-4"></i>
                            <p class="text-white font-medium mb-2">Click to upload photos or drag and drop</p>
                            <p class="text-gray-400 text-sm">
                                JPG, PNG, HEIC up to 10MB each • Max 5 photos<br>
                                Recommended: Front, back, sides, interior, problem areas
                            </p>
                        </div>
                        <input type="file" id="car-photos-input" multiple accept="image/*,.heic" class="hidden">
                    </div>

                    <!-- Photo Previews -->
                    <div id="photo-previews" class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 hidden"></div>

                    <!-- Upload Progress -->
                    <div id="upload-progress" class="mt-4 hidden">
                        <div class="bg-gray-700 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-white font-medium">Uploading photos...</span>
                                <span id="progress-text" class="text-purple-300">0%</span>
                            </div>
                            <div class="w-full bg-gray-600 rounded-full h-2">
                                <div id="progress-bar" class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <div class="flex justify-between mt-8">
                <button id="step2-back" class="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
                    <i class="fas fa-arrow-left mr-2"></i> Back
                </button>
                <button id="step2-next" class="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-lg border-2 border-white/20">
                    ✅ REVIEW BOOKING <i class="fas fa-arrow-right ml-2"></i>
                </button>
            </div>
        </div>
    `;
}

/**
 * Step 3: Booking Confirmation
 */
function getStep3HTML() {
    const selectedPackage = bookingState.packageType;
    const isCustom = selectedPackage === 'custom';

    let services = [];
    let totalPrice = 0;

    if (isCustom) {
        services = bookingState.customServices.map(serviceId => {
            const service = SERVICES[serviceId];
            if (service) {
                totalPrice += service.price;
                return service.name;
            }
        }).filter(Boolean);
    } else if (PACKAGES[selectedPackage]) {
        services = [PACKAGES[selectedPackage].name];
        totalPrice = PACKAGES[selectedPackage].price;
    }

    return `
        <div class="step-content" data-step="3">
            <h3 class="text-xl font-bold text-white mb-6">Confirm Your Booking</h3>

            <!-- Booking Summary -->
            <div class="bg-purple-900/30 rounded-lg p-6 mb-6">
                <h4 class="text-lg font-semibold text-white mb-4">Booking Summary</h4>

                <div class="space-y-3 text-gray-300">
                    <div class="flex justify-between">
                        <span>Services:</span>
                        <span class="text-white">${services.join(', ')}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Vehicle Type:</span>
                        <span class="text-white capitalize">${bookingState.customerData.carType}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Customer:</span>
                        <span class="text-white">${bookingState.customerData.customerName}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Phone:</span>
                        <span class="text-white">${bookingState.customerData.customerPhone}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Email:</span>
                        <span class="text-white">${bookingState.customerData.customerEmail}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Address:</span>
                        <span class="text-white text-right max-w-xs">${bookingState.customerData.address}</span>
                    </div>
                    ${bookingState.customerData.preferredDate ? `
                    <div class="flex justify-between">
                        <span>Preferred Date:</span>
                        <span class="text-white">${bookingState.customerData.preferredDate}</span>
                    </div>
                    ` : ''}
                    ${bookingState.customerData.preferredTime ? `
                    <div class="flex justify-between">
                        <span>Preferred Time:</span>
                        <span class="text-white">${bookingState.customerData.preferredTime}</span>
                    </div>
                    ` : ''}
                    ${bookingState.carPhotos.length > 0 ? `
                    <div class="flex justify-between">
                        <span>Car Photos:</span>
                        <span class="text-white">${bookingState.carPhotos.length} photo${bookingState.carPhotos.length === 1 ? '' : 's'} uploaded</span>
                    </div>
                    ` : ''}
                </div>

                <div class="border-t border-purple-500/30 mt-4 pt-4">
                    <div class="flex justify-between text-lg font-bold">
                        <span class="text-white">Total:</span>
                        <span class="text-green-400">$${totalPrice}</span>
                    </div>
                </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="bg-gray-800/50 rounded-lg p-4 mb-6">
                <h5 class="text-white font-semibold mb-2">Terms & Conditions</h5>
                <ul class="text-sm text-gray-300 space-y-1">
                    <li>• We will contact you within 2 hours to confirm appointment</li>
                    <li>• Payment is due after service completion</li>
                    <li>• 100% satisfaction guarantee</li>
                    <li>• 24-hour cancellation notice required</li>
                </ul>
            </div>

            <div class="flex justify-between mt-8">
                <button id="step3-back" class="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
                    <i class="fas fa-arrow-left mr-2"></i> Back
                </button>
                <button id="confirm-booking" class="px-12 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-2xl transition-all duration-300 flex items-center text-xl border-4 border-green-400/30 transform hover:scale-105 animate-pulse">
                    <i class="fas fa-check-circle mr-3 text-2xl"></i>
                    <span id="confirm-text">🚀 CONFIRM BOOKING NOW!</span>
                    <div id="confirm-spinner" class="hidden ml-3">
                        <i class="fas fa-spinner animate-spin text-2xl"></i>
                    </div>
                </button>
            </div>

            <!-- Mandatory Confirmation Checkbox -->
            <div class="mt-6 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
                <label class="flex items-start cursor-pointer">
                    <input type="checkbox" id="terms-agree" required class="mt-1 mr-3 h-5 w-5 text-green-600 bg-gray-800 border-yellow-500 rounded focus:ring-green-500">
                    <div class="text-white">
                        <span class="font-bold text-yellow-300">MANDATORY:</span> I confirm all information is correct and agree to the terms of service.
                        <span class="text-yellow-300 font-semibold">You MUST check this box to proceed.</span>
                    </div>
                </label>
            </div>
        </div>
    `;
}

/**
 * Open booking modal
 */
function openBookingModal() {
    document.getElementById('booking-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Close booking modal
 */
function closeBookingModal() {
    document.getElementById('booking-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    resetBookingState();
}

/**
 * Handle file upload
 */
async function handleFileUpload(files) {
    const maxFiles = 5;
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/jpg'];

    // Check if we already have max files
    if (bookingState.carPhotos.length >= maxFiles) {
        alert(`Maximum ${maxFiles} photos allowed. Please remove some photos first.`);
        return;
    }

    const validFiles = [];

    for (let file of files) {
        // Check file type
        if (!allowedTypes.includes(file.type.toLowerCase())) {
            alert(`${file.name}: Only JPG, PNG, and HEIC images are allowed.`);
            continue;
        }

        // Check file size
        if (file.size > maxFileSize) {
            alert(`${file.name}: File size must be less than 10MB.`);
            continue;
        }

        // Check total count
        if (bookingState.carPhotos.length + validFiles.length >= maxFiles) {
            alert(`Maximum ${maxFiles} photos allowed.`);
            break;
        }

        validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Process files
    showUploadProgress();

    for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];

        try {
            // Convert to base64 for storage and display
            const photoData = await processImageFile(file);
            bookingState.carPhotos.push(photoData);

            // Update progress
            const progress = ((i + 1) / validFiles.length) * 100;
            updateUploadProgress(progress);

        } catch (error) {
            console.error('Error processing file:', file.name, error);
            alert(`Error processing ${file.name}. Please try again.`);
        }
    }

    // Hide progress and update UI
    setTimeout(() => {
        hideUploadProgress();
        updatePhotoPreview();
        updateUploadArea();
    }, 500);
}

/**
 * Process image file (resize and convert to base64)
 */
function processImageFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
            const img = new Image();

            img.onload = function() {
                // Create canvas for resizing
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate new dimensions (max 1200px width/height)
                const maxSize = 1200;
                let { width, height } = img;

                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to base64 (JPEG with 85% quality)
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

                resolve({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    dataUrl: compressedDataUrl,
                    size: file.size,
                    originalWidth: img.width,
                    originalHeight: img.height,
                    compressedWidth: width,
                    compressedHeight: height
                });
            };

            img.onerror = reject;
            img.src = e.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Update photo preview display
 */
function updatePhotoPreview() {
    const previewContainer = document.getElementById('photo-previews');
    if (!previewContainer) return;

    if (bookingState.carPhotos.length === 0) {
        previewContainer.classList.add('hidden');
        return;
    }

    previewContainer.classList.remove('hidden');
    previewContainer.innerHTML = bookingState.carPhotos.map(photo => `
        <div class="relative group">
            <img src="${photo.dataUrl}" alt="${photo.name}" class="w-full h-32 object-cover rounded-lg border border-purple-500/30">
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button onclick="window.removePhoto('${photo.id}')" class="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors">
                    <i class="fas fa-trash text-sm"></i>
                </button>
            </div>
            <div class="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                ${photo.name.length > 15 ? photo.name.substring(0, 12) + '...' : photo.name}
            </div>
        </div>
    `).join('');
}

/**
 * Remove photo from collection
 */
window.removePhoto = function(photoId) {
    bookingState.carPhotos = bookingState.carPhotos.filter(photo => photo.id !== photoId);
    updatePhotoPreview();
    updateUploadArea();
}

/**
 * Update upload area based on photo count
 */
function updateUploadArea() {
    const uploadArea = document.getElementById('photo-upload-area');
    const uploadPrompt = document.getElementById('upload-prompt');
    if (!uploadArea || !uploadPrompt) return;

    if (bookingState.carPhotos.length >= 5) {
        uploadPrompt.innerHTML = `
            <i class="fas fa-check-circle text-4xl text-green-400 mb-4"></i>
            <p class="text-white font-medium mb-2">Maximum photos uploaded (5/5)</p>
            <p class="text-gray-400 text-sm">Remove photos above to add different ones</p>
        `;
        uploadArea.classList.add('opacity-50');
        uploadArea.style.pointerEvents = 'none';
    } else {
        uploadPrompt.innerHTML = `
            <i class="fas fa-cloud-upload-alt text-4xl text-purple-400 mb-4"></i>
            <p class="text-white font-medium mb-2">Click to upload photos or drag and drop</p>
            <p class="text-gray-400 text-sm">
                JPG, PNG, HEIC up to 10MB each • ${bookingState.carPhotos.length}/5 photos<br>
                Recommended: Front, back, sides, interior, problem areas
            </p>
        `;
        uploadArea.classList.remove('opacity-50');
        uploadArea.style.pointerEvents = 'auto';
    }
}

/**
 * Show upload progress
 */
function showUploadProgress() {
    const progressContainer = document.getElementById('upload-progress');
    if (progressContainer) {
        progressContainer.classList.remove('hidden');
    }
}

/**
 * Update upload progress
 */
function updateUploadProgress(percentage) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${Math.round(percentage)}%`;
}

/**
 * Hide upload progress
 */
function hideUploadProgress() {
    const progressContainer = document.getElementById('upload-progress');
    if (progressContainer) {
        progressContainer.classList.add('hidden');
    }
}

/**
 * Setup event listeners for booking system
 */
function setupBookingEventListeners() {
    // Close modal events
    document.addEventListener('click', (e) => {
        if (e.target.id === 'close-booking' || e.target.id === 'booking-modal') {
            closeBookingModal();
        }
    });

    // Address validation events
    document.addEventListener('input', (e) => {
        if (['street-address-input', 'city-input', 'zip-input'].includes(e.target.id)) {
            debounceAddressValidation();
        }
    });

    // Photo upload events
    document.addEventListener('click', (e) => {
        if (e.target.closest('#photo-upload-area')) {
            const fileInput = document.getElementById('car-photos-input');
            if (fileInput) fileInput.click();
        }
    });

    // File input change event
    document.addEventListener('change', (e) => {
        if (e.target.id === 'car-photos-input') {
            handleFileUpload(e.target.files);
        }
    });

    // Drag and drop events
    document.addEventListener('dragover', (e) => {
        const uploadArea = document.getElementById('photo-upload-area');
        if (uploadArea && uploadArea.contains(e.target)) {
            e.preventDefault();
            uploadArea.classList.add('border-purple-400', 'bg-purple-900/20');
        }
    });

    document.addEventListener('dragleave', (e) => {
        const uploadArea = document.getElementById('photo-upload-area');
        if (uploadArea && !uploadArea.contains(e.relatedTarget)) {
            uploadArea.classList.remove('border-purple-400', 'bg-purple-900/20');
        }
    });

    document.addEventListener('drop', (e) => {
        const uploadArea = document.getElementById('photo-upload-area');
        if (uploadArea && uploadArea.contains(e.target)) {
            e.preventDefault();
            uploadArea.classList.remove('border-purple-400', 'bg-purple-900/20');
            handleFileUpload(e.dataTransfer.files);
        }
    });

    // Package selection
    document.addEventListener('click', (e) => {
        if (e.target.closest('.package-option')) {
            const packageOption = e.target.closest('.package-option');
            const packageType = packageOption.dataset.package;

            // Remove previous selections
            document.querySelectorAll('.package-option').forEach(el => el.classList.remove('selected'));

            // Add selection
            packageOption.classList.add('selected');
            bookingState.packageType = packageType;

            // Show/hide custom services
            const customServices = document.getElementById('custom-services');
            if (packageType === 'custom') {
                customServices.classList.remove('hidden');
            } else {
                customServices.classList.add('hidden');
                bookingState.customServices = [];
            }

            updateStep1NextButton();
        }
    });

    // Car type selection
    document.addEventListener('click', (e) => {
        if (e.target.closest('.car-type-option')) {
            const carOption = e.target.closest('.car-type-option');

            // Remove previous selections
            document.querySelectorAll('.car-type-option').forEach(el => el.classList.remove('selected'));

            // Add selection
            carOption.classList.add('selected');
            bookingState.carType = carOption.dataset.carType;

            updateStep1NextButton();
        }
    });

    // Custom service selection
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('service-checkbox')) {
            const serviceId = e.target.dataset.service;
            const price = parseInt(e.target.dataset.price);

            if (e.target.checked) {
                bookingState.customServices.push(serviceId);
            } else {
                bookingState.customServices = bookingState.customServices.filter(id => id !== serviceId);
            }

            updateCustomTotal();
            updateStep1NextButton();
        }
    });

    // Step navigation
    document.addEventListener('click', (e) => {
        if (e.target.id === 'step1-next') {
            goToStep(2);
        } else if (e.target.id === 'step2-back') {
            goToStep(1);
        } else if (e.target.id === 'step2-next') {
            if (validateStep2()) {
                goToStep(3);
            }
        } else if (e.target.id === 'step3-back') {
            goToStep(2);
        } else if (e.target.id === 'confirm-booking') {
            submitBooking();
        }
    });
}

// Address validation debouncing
let addressValidationTimeout;
function debounceAddressValidation() {
    clearTimeout(addressValidationTimeout);
    addressValidationTimeout = setTimeout(validateAndShowAddress, 1000);
}

/**
 * Validate and show address on map
 */
async function validateAndShowAddress() {
    const streetInput = document.getElementById('street-address-input');
    const cityInput = document.getElementById('city-input');
    const zipInput = document.getElementById('zip-input');
    const mapPreview = document.getElementById('address-map-preview');
    const validatedAddress = document.getElementById('validated-address');

    if (!streetInput || !cityInput || !zipInput) return;

    const street = streetInput.value.trim();
    const city = cityInput.value.trim();
    const zip = zipInput.value.trim();

    // Only validate if we have basic address info
    if (street.length < 3 || city.length < 2) {
        mapPreview?.classList.add('hidden');
        return;
    }

    const fullAddress = `${street}, ${city}, CA ${zip}`;

    try {
        // Simple client-side validation for now
        const isValidAddress = validateAddressFormat(street, city, zip);

        if (isValidAddress && mapPreview && validatedAddress) {
            validatedAddress.textContent = fullAddress;
            mapPreview.classList.remove('hidden');

            // Add success styling to inputs
            [streetInput, cityInput, zipInput].forEach(input => {
                input.classList.remove('border-red-500', 'border-yellow-500');
                input.classList.add('border-green-500');
            });

            console.log('✅ Address format validated:', fullAddress);
        } else {
            // Address format seems incomplete
            [streetInput, cityInput, zipInput].forEach(input => {
                input.classList.remove('border-green-500', 'border-red-500');
                input.classList.add('border-yellow-500');
            });
            mapPreview?.classList.add('hidden');
            console.log('⚠️ Address format needs improvement');
        }
    } catch (error) {
        console.error('Address validation error:', error);
        mapPreview?.classList.add('hidden');

        // Reset input styling on error
        [streetInput, cityInput, zipInput].forEach(input => {
            input.classList.remove('border-green-500', 'border-yellow-500');
        });
    }
}

/**
 * Simple address format validation
 */
function validateAddressFormat(street, city, zip) {
    // Basic address format validation
    const streetValid = street.length >= 5 && /\d/.test(street); // Has numbers
    const cityValid = city.length >= 2 && /^[a-zA-Z\s]+$/.test(city); // Letters only
    const zipValid = /^\d{5}(-\d{4})?$/.test(zip); // 5 or 9 digit ZIP

    return streetValid && cityValid && zipValid;
}

/**
 * Update custom services total
 */
function updateCustomTotal() {
    const total = bookingState.customServices.reduce((sum, serviceId) => {
        const service = SERVICES[serviceId];
        return sum + (service ? service.price : 0);
    }, 0);

    const totalElement = document.getElementById('custom-total');
    if (totalElement) {
        totalElement.textContent = `$${total}`;
    }
}

/**
 * Update Step 1 next button state
 */
function updateStep1NextButton() {
    const nextButton = document.getElementById('step1-next');
    if (nextButton) {
        const hasPackage = bookingState.packageType;
        const hasServices = bookingState.packageType !== 'custom' || bookingState.customServices.length > 0;
        const hasCarType = bookingState.carType;

        nextButton.disabled = !(hasPackage && hasServices && hasCarType);
    }
}

/**
 * Validate Step 2 form
 */
function validateStep2() {
    const form = document.getElementById('customer-details-form');
    if (!form) return false;

    const formData = new FormData(form);
    const required = ['customerName', 'customerPhone', 'customerEmail', 'streetAddress', 'city', 'zipCode'];

    for (const field of required) {
        const value = formData.get(field);
        if (!value || value.trim() === '') {
            const fieldName = field.replace('customer', '').replace(/([A-Z])/g, ' $1').toLowerCase().replace('address', 'address').replace('zip code', 'ZIP code');
            alert(`❌ Please fill in the ${fieldName} field.`);
            return false;
        }
    }

    // Validate email format
    const email = formData.get('customerEmail');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('❌ Please enter a valid email address.');
        return false;
    }

    // Validate phone format (basic)
    const phone = formData.get('customerPhone');
    const phoneRegex = /[\d\s\-\(\)\+]{10,}/;
    if (!phoneRegex.test(phone)) {
        alert('❌ Please enter a valid phone number (at least 10 digits).');
        return false;
    }

    // Store form data
    for (const [key, value] of formData) {
        bookingState.customerData[key] = value;
    }

    // Combine address fields for display
    bookingState.customerData.address = `${formData.get('streetAddress')}, ${formData.get('city')}, CA ${formData.get('zipCode')}`;
    bookingState.customerData.carType = bookingState.carType;

    return true;
}

/**
 * Go to specific step
 */
function goToStep(stepNumber) {
    bookingState.step = stepNumber;

    // Update progress indicators
    document.querySelectorAll('.step-indicator').forEach((el, index) => {
        el.classList.toggle('active', index + 1 <= stepNumber);
    });

    // Update content
    const content = document.getElementById('booking-content');
    if (content) {
        if (stepNumber === 1) {
            content.innerHTML = getStep1HTML();
        } else if (stepNumber === 2) {
            content.innerHTML = getStep2HTML();
        } else if (stepNumber === 3) {
            content.innerHTML = getStep3HTML();
        }

        // Restore selections if going back
        if (stepNumber === 1) {
            restoreStep1Selections();
        }
    }
}

/**
 * Restore Step 1 selections when going back
 */
function restoreStep1Selections() {
    // Restore package selection
    if (bookingState.packageType) {
        const packageOption = document.querySelector(`[data-package="${bookingState.packageType}"]`);
        if (packageOption) {
            packageOption.classList.add('selected');

            if (bookingState.packageType === 'custom') {
                document.getElementById('custom-services').classList.remove('hidden');

                // Restore service selections
                bookingState.customServices.forEach(serviceId => {
                    const checkbox = document.querySelector(`[data-service="${serviceId}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });

                updateCustomTotal();
            }
        }
    }

    // Restore car type selection
    if (bookingState.carType) {
        const carOption = document.querySelector(`[data-car-type="${bookingState.carType}"]`);
        if (carOption) {
            carOption.classList.add('selected');
        }
    }

    updateStep1NextButton();
}

/**
 * Submit booking to API
 */
async function submitBooking() {
    if (bookingState.isSubmitting) return;

    // Check mandatory terms checkbox
    const termsCheckbox = document.getElementById('terms-agree');
    if (!termsCheckbox || !termsCheckbox.checked) {
        alert('❌ MANDATORY: You must check the confirmation box to proceed with booking!');
        termsCheckbox?.focus();
        return;
    }

    bookingState.isSubmitting = true;

    // Update button state
    const confirmButton = document.getElementById('confirm-booking');
    const confirmText = document.getElementById('confirm-text');
    const confirmSpinner = document.getElementById('confirm-spinner');

    confirmButton.disabled = true;
    confirmText.textContent = '🔄 Processing Booking...';
    confirmSpinner.classList.remove('hidden');
    confirmButton.classList.remove('animate-pulse');

    try {
        const bookingData = {
            customerName: bookingState.customerData.customerName,
            customerPhone: bookingState.customerData.customerPhone,
            customerEmail: bookingState.customerData.customerEmail,
            carType: bookingState.customerData.carType,
            packageType: bookingState.packageType,
            customServices: bookingState.customServices,
            preferredDate: bookingState.customerData.preferredDate,
            preferredTime: bookingState.customerData.preferredTime,
            address: bookingState.customerData.address,
            streetAddress: bookingState.customerData.streetAddress,
            city: bookingState.customerData.city,
            zipCode: bookingState.customerData.zipCode,
            specialInstructions: bookingState.customerData.specialInstructions,
            carPhotos: bookingState.carPhotos, // Include photo data
            termsAccepted: true,
            submittedAt: new Date().toISOString()
        };

        const response = await fetch('/api/book-appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (result.success) {
            showSuccessMessage(result.bookingId);
            closeBookingModal();
        } else {
            throw new Error(result.error || 'Booking failed');
        }

    } catch (error) {
        console.error('Booking error:', error);
        alert('❌ Sorry, there was an error processing your booking. Please call us directly at (855) 529-7627 or try again.');

        // Reset button state
        confirmButton.disabled = false;
        confirmText.textContent = '🚀 CONFIRM BOOKING NOW!';
        confirmSpinner.classList.add('hidden');
        confirmButton.classList.add('animate-pulse');
        bookingState.isSubmitting = false;
    }
}

/**
 * Show success message
 */
function showSuccessMessage(bookingId) {
    const successHTML = `
        <div class="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div class="bg-gray-900 border border-green-500/30 rounded-2xl p-8 max-w-md mx-4 text-center">
                <div class="text-green-400 text-6xl mb-4">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 class="text-2xl font-bold text-white mb-4">Booking Confirmed!</h3>
                <p class="text-gray-300 mb-4">
                    Your appointment has been booked successfully.<br>
                    <strong class="text-green-400">Booking ID: ${bookingId}</strong>
                </p>
                <p class="text-sm text-gray-400 mb-6">
                    We will contact you at ${bookingState.customerData.customerPhone} within 2 hours to confirm your appointment.
                </p>
                <button onclick="this.parentElement.parentElement.remove()" class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300">
                    Great! <i class="fas fa-thumbs-up ml-2"></i>
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', successHTML);
}

/**
 * Reset booking state
 */
function resetBookingState() {
    bookingState = {
        step: 1,
        packageType: '',
        customServices: [],
        customerData: {},
        carPhotos: [], // Reset photos
        isSubmitting: false
    };
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initBookingSystem);

// Export for use in other modules
window.JaysBookingSystem = {
    openBookingModal,
    closeBookingModal,
    initBookingSystem
};
