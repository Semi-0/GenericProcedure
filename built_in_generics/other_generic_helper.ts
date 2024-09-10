


export function guard(condition: boolean, else_branch: () => void): void {
    if (condition) {
        return
    } else {
        else_branch()
    }
}


export function deepCopy<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        const arrCopy = [] as any[];
        for (const item of obj) {
            arrCopy.push(deepCopy(item));
        }
        return arrCopy as unknown as T;
    }
    else{
        const objCopy = {} as { [key: string]: any };
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                objCopy[key] = deepCopy((obj as { [key: string]: any })[key]);
            }
        }
        return objCopy as T;
    }
}
