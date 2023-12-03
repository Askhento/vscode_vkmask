export function reduceError(error, path) {
    // @ts-expect-error
    const { _errors, ...newError } = { ...error }; // remove _errors field
    if (Object.keys(newError).length === 0) {
        return { path, message: _errors[0] };
    }
    const key = Object.keys(newError)[0];
    return reduceError(newError[key], [...path, key]);
}
