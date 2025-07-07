> **Note:** The following SFCC (Salesforce Commerce Cloud) integration notes and best practices are for future reference only. The current Jay's Mobile Wash AI system does not use SFCC hosting, cartridges, or server-side code. All features run independently of SFCC. Only use this section if you plan to migrate or expand to SFCC in the future.
# Jay's Mobile Wash AI System: Implementation Notes

## Current System Features
- Multi-model AI system using OpenRouter
- Dynamic model selection and routing
- Memory and context management
- Analytics and error tracking
- Robust error handling and fallbacks

## Hosting & Cost Considerations
- You may need to pay for:
  - Web/app hosting (e.g., Vercel, AWS, Azure)
  - API usage for each AI model/provider (e.g., OpenRouter, DeepSeek)
  - Storage, bandwidth, and any additional cloud services
- No extra cost for the code itself, but running the system and using external AI models will have associated costs.

## Future Expansion Notes
- System is ready for robust multi-model AI routing
- Can add more models/APIs as needed (update registry and routing logic)
- All features (chat, quote, memory, analytics, etc.) should work with any model
- Ensure accessibility (a11y) and error handling for all user-facing features

---

This document is for reference. The current focus is on improving and expanding the existing system.
