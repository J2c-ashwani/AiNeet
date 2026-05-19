export async function checkedFetch(input, init = {}, options = {}) {
    const timeoutMs = options.timeoutMs ?? 15_000;
    const controller = new AbortController();
    const timeout = timeoutMs > 0
        ? setTimeout(() => controller.abort(new Error('FETCH_TIMEOUT')), timeoutMs)
        : null;

    if (init.signal) {
        if (init.signal.aborted) controller.abort(init.signal.reason);
        else init.signal.addEventListener('abort', () => controller.abort(init.signal.reason), { once: true });
    }

    let response;
    try {
        response = await globalThis['fetch'](input, {
            ...init,
            signal: controller.signal,
        });
    } finally {
        if (timeout) clearTimeout(timeout);
    }

    const allowedStatuses = options.allowedStatuses || [];

    if (!response.ok && !allowedStatuses.includes(response.status)) {
        throw new Error(`${options.errorMessage || 'HTTP request failed'}: ${response.status} ${response.statusText}`);
    }

    const maxBytes = options.maxBytes;
    if (maxBytes) {
        const contentLength = Number(response.headers.get('content-length') || 0);
        if (contentLength > maxBytes) {
            throw new Error(`${options.errorMessage || 'HTTP request failed'}: response too large`);
        }
    }

    return response;
}
