export function cancellationToken() {
    let isCancelledState = false;
    let resolver = () => {};

    return {
        get isCancelled() {
            return isCancelledState;
        },
        cancel() {
            resolver(null);
            isCancelledState = true;
        },
        promisedCancellation: new Promise(resolve => {
            resolver = resolve;
        }),
    };
}