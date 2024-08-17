import { construct_simple_generic_procedure, define_generic_procedure_handler } from "../GenericProcedure";
import { match_args, match_one_of_preds } from "../Predicates";
import { is_array } from "./generic_array";
import { is_object } from "./generic_predicates";

export function guard(condition: boolean, else_branch: () => void): void {
    if (condition) {
        return
    } else {
        else_branch()
    }
}

export const copy = construct_simple_generic_procedure(
    "copy",
    1
) 

define_generic_procedure_handler(copy, match_one_of_preds(is_array, is_object), (a: any[]) => {
    return deepCopy(a)
})

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
