export const DynamicPromise = <T>() => {
    let ret = {} as { Promise: any, Resolve: T }
    ret.Promise = new Promise(resolve => { ret.Resolve = resolve as T })
    return ret as { Promise: Promise<T>, Resolve: (Data: T) => any }
}