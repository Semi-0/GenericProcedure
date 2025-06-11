import { get_predicates, is_predicate_registered, Predicate } from "../Predicates"




export function guard(condition: boolean, else_branch: () => void): void {
    if (condition) {
        return
    } else {
        else_branch()
    }
}

export function throw_error(components_area: string, error_name: string, details: string): () => never {
   return () => {throw new Error( error_name  + ": " + details + " in " + components_area)}
}

export function throw_type_mismatch(components_area: string, expected: string, actual: string): () => never {
   return throw_error(components_area, "type mismatch", "expected " + expected + ", but got " + actual)
}

export function log_error(message: string): void {
    console.error(message)
}

export function guarantee_type(components_area: string, obj: any, type: string): void {
    return guard(typeof obj === type,  throw_type_mismatch(components_area, type, typeof obj)) 
}

export function guarantee_predicate_registered(components_area: string, predicate: (arg: any) => boolean): void {
   return guard(is_predicate_registered(predicate), () => throw_error(components_area, "predicate not registered", predicate.toString()))
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
