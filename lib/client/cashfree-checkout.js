const CASHFREE_SDK_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';

function loadCashfreeSdk() {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Checkout is only available in the browser.'));
    }

    if (window.Cashfree) {
        return Promise.resolve(window.Cashfree);
    }

    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${CASHFREE_SDK_URL}"]`);
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(window.Cashfree), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Payment checkout failed to load.')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = CASHFREE_SDK_URL;
        script.async = true;
        script.onload = () => resolve(window.Cashfree);
        script.onerror = () => reject(new Error('Payment checkout failed to load.'));
        document.head.appendChild(script);
    });
}

export async function openCashfreeCheckout({ paymentSessionId, environment }) {
    if (!paymentSessionId || typeof paymentSessionId !== 'string') {
        throw new Error('Payment session could not be created.');
    }

    const Cashfree = await loadCashfreeSdk();
    if (typeof Cashfree !== 'function') {
        throw new Error('Payment checkout is unavailable. Please try again.');
    }

    const cashfree = Cashfree({
        mode: environment === 'production' ? 'production' : 'sandbox',
    });

    await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
    });
}
