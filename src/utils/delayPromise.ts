
export const delayPromise = (delay: number, value?: unknown): { promise: Promise<any>, cancel: Function } => {
    let timeout: NodeJS.Timeout | null;
    let _reject: ((reason?: any) => void) | null;
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
                if (_reject)
                    _reject();
                _reject = null;
            }
        }
    };
};