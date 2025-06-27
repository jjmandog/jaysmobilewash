/**
 * Google Business Profile Integration - Minimal Version
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log("Google Business Integration initialized");
  
  // Basic functionality to avoid errors
  const container = document.getElementById('gmb-posts-container');
  const loading = document.getElementById('gmb-loading');
  
  if (container) {
    container.innerHTML = `
      <div class="gmb-post update">
        <div class="post-image">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%232a2a3a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%238a4bff'%3EJay's Mobile Wash%3C/text%3E%3C/svg%3E" alt="Jay's Mobile Wash Update" width="300" height="200">
          <span class="post-type">UPDATE</span>
        </div>
        <div class="post-content">
          <h4>Now Serving All of Los Angeles</h4>
          <p>We've expanded our service area to cover all of Los Angeles and Orange County!</p>
          <div class="post-meta">
            <span class="post-date">Recent</span>
            <a href="/" class="post-cta btn-sm">Learn More</a>
          </div>
        </div>
      </div>
    `;
  }
  
  if (loading) {
    loading.style.display = 'none';
  }
  
  // Expose for event handling
  window.gbpIntegration = {
    trackPostClick: function() {
      console.log("Post click tracked");
    }
  };
});
