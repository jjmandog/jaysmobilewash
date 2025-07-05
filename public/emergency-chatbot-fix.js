// Emergency visibility fix - inject directly into page with inline styles
console.log('🚨 Emergency chatbot visibility fix loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Applying emergency visibility fix...');
    const widget = document.querySelector('.advanced-chatbot-widget');
    if (widget) {
        console.log('✅ Found existing widget, applying visibility fix...');
        widget.style.cssText = `
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            z-index: 999999 !important;
            visibility: visible !important;
            opacity: 1 !important;
            display: block !important;
            pointer-events: auto !important;
            width: auto !important;
            height: auto !important;
            background: rgba(255, 0, 0, 0.1) !important;
            border: 2px solid red !important;
            padding: 5px !important;
        `;
        const toggle = widget.querySelector('.chatbot-toggle');
        if (toggle) {
            console.log('✅ Found toggle button, applying styles...');
            toggle.style.cssText = `
                background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%) !important;
                color: white !important;
                padding: 15px 20px !important;
                border-radius: 50px !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4) !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                border: none !important;
                position: relative !important;
                z-index: 999999 !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
                width: auto !important;
                height: auto !important;
                min-width: 120px !important;
                min-height: 40px !important;
            `;
        }
        console.log('✅ Emergency visibility fix applied!');
    } else {
        console.log('❌ No widget found, creating emergency widget...');
        const emergencyWidget = document.createElement('div');
        emergencyWidget.innerHTML = `
            <div class="chatbot-toggle" style="
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                z-index: 999999 !important;
                background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%) !important;
                color: white !important;
                padding: 15px 20px !important;
                border-radius: 50px !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4) !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                border: none !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
                width: auto !important;
                height: auto !important;
                min-width: 120px !important;
                min-height: 40px !important;
            ">
                💬 Chat with Jay
            </div>
        `;
        document.body.appendChild(emergencyWidget);
        console.log('✅ Emergency widget created!');
    }
    console.log('🔍 All chatbot elements:', document.querySelectorAll('[class*="chatbot"]'));
    setTimeout(() => {
        const widget = document.querySelector('.advanced-chatbot-widget');
        if (widget) {
            const styles = window.getComputedStyle(widget);
            console.log('🎨 Widget computed styles:', {
                position: styles.position,
                bottom: styles.bottom,
                right: styles.right,
                zIndex: styles.zIndex,
                visibility: styles.visibility,
                opacity: styles.opacity,
                display: styles.display,
                pointerEvents: styles.pointerEvents,
                width: styles.width,
                height: styles.height
            });
        }
    }, 1000);
});
