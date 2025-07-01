# SPA SEO Head Manager Utility

## Overview

The SPA SEO Head Manager is a JavaScript utility that provides dynamic SEO meta tag management for Single Page Applications and websites with dynamic content. It allows for real-time updates of page titles, meta descriptions, Open Graph tags, Twitter Cards, structured data, and more.

## Features

- ✅ Dynamic title updates
- ✅ Meta description management
- ✅ Canonical URL updates  
- ✅ Open Graph meta tags
- ✅ Twitter Card support
- ✅ Keywords management
- ✅ Structured data (JSON-LD) updates
- ✅ Mutation observer for DOM changes
- ✅ Fallback to original values

## Installation

The script has been added to all main HTML pages in the Jay's Mobile Wash website:

```html
<!-- SPA SEO Head Manager Utility -->
<script src="spa-seo-head-manager.js"></script>
```

## Usage

### Basic SEO Update

```javascript
// Update multiple SEO elements at once
window.updatePageSEO({
    title: 'New Page Title - Jay\'s Mobile Wash',
    description: 'Updated page description with relevant keywords',
    canonical: 'https://www.jaysmobilewash.net/new-page/',
    keywords: 'mobile detailing, ceramic coating, los angeles'
});
```

### Open Graph Updates

```javascript
window.updatePageSEO({
    openGraph: {
        title: 'Mobile Detailing Services',
        description: 'Professional mobile car detailing in Los Angeles',
        image: 'https://www.jaysmobilewash.net/og-image.jpg',
        url: 'https://www.jaysmobilewash.net/services/'
    }
});
```

### Twitter Card Updates

```javascript
window.updatePageSEO({
    twitterCard: {
        title: 'Premium Car Detailing',
        description: 'We bring the car wash to you!',
        image: 'https://www.jaysmobilewash.net/twitter-card.jpg'
    }
});
```

### Structured Data Updates

```javascript
window.updatePageSEO({
    structuredData: {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Mobile Car Detailing",
        "provider": {
            "@type": "LocalBusiness",
            "name": "Jay's Mobile Wash"
        }
    }
});
```

### Reset to Original Values

```javascript
// Reset all SEO data to original page values
window.resetSEO();
```

## API Reference

### SPASEOManager Class Methods

#### `updateSEO(seoData)`
Updates multiple SEO elements based on the provided configuration object.

**Parameters:**
- `seoData` (Object) - Configuration object with SEO data

**Example seoData structure:**
```javascript
{
    title: "Page Title",
    description: "Meta description",
    canonical: "https://example.com/page/",
    keywords: "keyword1, keyword2, keyword3",
    openGraph: {
        title: "OG Title",
        description: "OG Description",
        image: "https://example.com/image.jpg",
        url: "https://example.com/page/"
    },
    twitterCard: {
        title: "Twitter Title",
        description: "Twitter Description",
        image: "https://example.com/twitter-image.jpg"
    },
    structuredData: { /* JSON-LD object */ }
}
```

#### `updateTitle(title)`
Updates the page title and related Open Graph/Twitter meta tags.

#### `updateMetaDescription(description)`
Updates the meta description and related social media tags.

#### `updateCanonical(url)`
Updates the canonical URL link tag.

#### `resetToOriginal()`
Resets all SEO data to the original page values.

## Browser Support

- Modern browsers with ES6 support
- MutationObserver support (optional feature)
- Works in all major browsers including Chrome, Firefox, Safari, Edge

## Use Cases for Jay's Mobile Wash

1. **Dynamic Service Pages**: Update SEO data when switching between different services
2. **Location-Based Content**: Modify meta tags based on selected service areas
3. **Promotional Updates**: Dynamically update titles and descriptions for special offers
4. **Blog Content**: Update structured data for blog posts and articles
5. **Booking Flow**: Enhance SEO during the booking process steps

## Console Logging

The manager logs initialization and important events to the browser console:

```
SPA SEO Head Manager initialized
Head section changed - SPA SEO Manager tracking
```

## Files Modified

The following files now include the SPA SEO Head Manager script:

- `index.html`
- `services-interior-detailing.html`
- `services-exterior-detailing.html`
- `services-ceramic-coating.html`
- `locations-los-angeles.html`
- `locations-beverly-hills.html`
- `locations-orange-county.html`
- `about.html`
- `privacy.html`
- `terms.html`
- `products.html`

## Testing

The utility has been tested for:
- ✅ JavaScript syntax validation
- ✅ HTML validation with HTMLHint
- ✅ Script loading verification
- ✅ Basic functionality testing

## Future Enhancements

Potential improvements for future versions:
- Analytics integration for SEO changes
- A/B testing support for different meta configurations
- Integration with Google Search Console
- Automatic sitemap updates
- SEO audit functionality