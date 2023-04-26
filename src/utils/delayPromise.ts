
export const delayPromise = (delay: number, value?: unknown): { promise: Promise<any>, cancel: Function } => {
    let timeout;
    let _reject;
    const promise = new Promise((resolve, reject) => {
        _reject = reject;
        timeout = setTimeout(resolve, delay, value);
    });
    return {
        promise,
        cancel() {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
                _reject();
                _reject = null;
            }
        }
    };
};