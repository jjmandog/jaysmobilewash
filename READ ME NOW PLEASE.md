# READ ME NOW PLEASE - Jay's Mobile Wash Website Notes

## Last Updated: March 2, 2026

---

## ⚠️ CRITICAL: Branch & Deployment Info

### Which branch is the LIVE site?
- **`working-chatbot`** = THE LIVE WORKING BRANCH (deploys to Vercel successfully)
- **`main`** = BROKEN ON VERCEL (builds fail, do NOT rely on this for production)

### Vercel Deployment
- Vercel is connected to the GitHub repo: `jjmandog/jaysmobilewash`
- The **`working-chatbot`** branch is what actually builds and deploys correctly
- Pushing to `main` will trigger a Vercel build but it will **ERROR out**
- Always push changes to `working-chatbot` for the live site

---

## 🔄 Recent Changes (March 2, 2026)

### AI Search / SEO Optimization
Added "Who is the best mobile car detailer near me?" FAQ content to help the site rank when users ask AI assistants (ChatGPT, Google AI, etc.) about the best local detailer.

**Files modified:**
1. **`index.html`** — Added AI search FAQ item + JSON-LD FAQPage schema entry
2. **`locations-los-angeles.html`** — Added LA-specific "best detailer near me" FAQ + schema
3. **`locations-orange-county.html`** — Added OC-specific "best detailer near me" FAQ + schema, updated Yelp rating text to "4.7 stars from 31 reviews"

### What was added to each page:
- A visible FAQ question: "Who is the best mobile car detailer near me in [location]?"
- An answer mentioning ChatGPT, Google, 4.9-star rating, 150+ reviews, and Jay's Mobile Wash
- Matching JSON-LD `FAQPage` schema so search engines and AI bots can read it

---

## 📋 URLs to Submit for Google Indexing

Submit these 3 URLs in Google Search Console to get the new AI search content indexed:

1. `https://www.jaysmobilewash.net/`
2. `https://www.jaysmobilewash.net/locations/los-angeles/`
3. `https://www.jaysmobilewash.net/locations/orange-county/`

---

## 🔗 Backlink Strategy

A backlink strategy was also created during this session. Key actions:
- Submit to local business directories (Yelp, Google Business, Bing Places, Apple Maps)
- Reach out to local car blogs and OC/LA lifestyle sites for mentions
- Get listed on detailing-specific directories
- Consider partnerships with local businesses for cross-linking

---

## 🔗 Real Social & Business Profile Links (Added March 2, 2026)

All of these are now in the site's JSON-LD schema (`sameAs`) and footer links:
- **Instagram**: https://www.instagram.com/jayswaxandwash/
- **Facebook**: https://www.facebook.com/jayswaxandwash/
- **Yelp (Buena Park/OC)**: https://www.yelp.com/biz/jay-s-mobile-wash-buena-park
- **Yelp (LA/Gardena)**: https://www.yelp.com/biz/jay-s-mobile-wash-la-gardena
- **MapQuest**: https://www.mapquest.com/us/california/jays-mobile-wash-la-706668333
- **Google Maps**: https://maps.app.goo.gl/ZCAGfF26grj6ofFS9

---

## 🤖 robots.txt Fix (March 2, 2026)

**GPTBot and ChatGPT-User were previously BLOCKED** in robots.txt — changed to Allow so AI bots can crawl the site and discover the business.

---

## 🏗️ Website Structure Notes

- The site uses static HTML files (not a framework like React/Next.js)
- CSS uses Tailwind-style utility classes in `index.html` and custom CSS in location pages
- `index.html` has a binary encoding issue (UTF-16LE) — was converted to UTF-8 during this session
- Location pages (`locations-los-angeles.html`, `locations-orange-county.html`) use standard UTF-8
- The booking system JS exists in both root (`booking-system.js`) and `public/` folder

---

## ⚡ Quick Commands

```bash
# Switch to the working branch
git checkout working-chatbot

# Push changes to live site (Vercel)
git add .
git commit -m "your message here"
git push origin working-chatbot

# DO NOT push to main for Vercel — it will fail!
```
