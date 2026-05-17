const MONITORED_QUERY = Symbol('monitored_supabase_query');

function reportSupabaseReadError(error, state) {
    const payload = {
        table: state.table || 'unknown',
        operation: 'select',
        code: error.code,
        hint: error.hint,
        details: error.details,
        message: error.message,
    };

    console.error('[DB_READ_MONITOR]', payload);
}

function monitorQueryBuilder(builder, state) {
    if (!builder || typeof builder !== 'object' || builder[MONITORED_QUERY]) {
        return builder;
    }

    return new Proxy(builder, {
        get(target, prop, receiver) {
            if (prop === MONITORED_QUERY) return true;

            if (prop === 'then') {
                const then = Reflect.get(target, prop, target);
                return (onFulfilled, onRejected) => then.call(target, (result) => {
                    if (state.didSelect && result?.error) {
                        reportSupabaseReadError(result.error, state);
                    }
                    return onFulfilled ? onFulfilled(result) : result;
                }, onRejected);
            }

            const value = Reflect.get(target, prop, receiver);
            if (typeof value !== 'function') return value;

            return (...args) => {
                if (prop === 'select') state.didSelect = true;
                const next = value.apply(target, args);
                return monitorQueryBuilder(next, state);
            };
        },
    });
}

export function monitorSupabaseClient(client, context = {}) {
    if (!client || typeof client !== 'object') return client;

    return new Proxy(client, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (prop !== 'from' || typeof value !== 'function') return value;

            return (...args) => {
                const table = args[0];
                const builder = value.apply(target, args);
                return monitorQueryBuilder(builder, {
                    ...context,
                    table,
                    didSelect: false,
                });
            };
        },
    });
}
