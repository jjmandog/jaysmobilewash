## SFCC Integration & Best Practices (for Future Expansion)

- **Platform:** Salesforce Commerce Cloud (SFCC) uses server-side JavaScript (SSJS) and a cartridge-based architecture.
- **API Usage:** Use `require('dw/...')` for SFCC APIs, and wrap data modifications in `Transaction.wrap(function() {})`.
- **Controllers:** Place in `cartridge/controllers/` using the `server` module pattern. Use `server.get()`, `server.post()`, etc. Export with `module.exports = server.exports()`.
- **Services:** Define in `cartridge/scripts/services/` and register in `services.xml`. Use `LocalServiceRegistry.createService()` for external API calls.
- **Hooks:** Extend OCAPI/SCAPI with hooks in `cartridge/scripts/hooks/` and register in `hooks.json`. Use `dw/system/HookMgr` for extensibility.
- **Models:** Place in `cartridge/models/` and use CommonJS `require()` for imports.
- **Templates:** Use ISML templates in `cartridge/templates/default/` with proper encoding and localization via `${Resource.msg()}`.
- **Logging:** Use `dw/system/Logger` for error and info logging. Log custom errors for troubleshooting.
- **Error Handling:** Always use try/catch and log errors. Return proper status objects in hooks/controllers.
- **Security:** Use `dw/crypto` for cryptography, `dw/util/SecureEncoder` for XSS prevention, and CSRF protection for forms.
- **Page Designer:** For UI, use Page Designer components/pages in `cartridge/experience/` and follow meta/script separation.
- **Forms:** Define in `cartridge/forms/default/` and handle with server-side validation and localization.

For more details, see the full SFCC instructions in `.github/instructions/prophet-sfcc.instructions.md` and official [SFCC documentation](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html).
