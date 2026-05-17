export async function checkedFetch(input, init = {}, options = {}) {
    const response = await globalThis['fetch'](input, init);
    const allowedStatuses = options.allowedStatuses || [];

    if (!response.ok && !allowedStatuses.includes(response.status)) {
        throw new Error(`${options.errorMessage || 'HTTP request failed'}: ${response.status} ${response.statusText}`);
    }

    return response;
}
