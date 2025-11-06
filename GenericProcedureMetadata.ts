import type { Int } from "./types";
import { SimpleDispatchStore } from "./DispatchStore";
import type { DispatchStore } from "./DispatchStore";
import { Applicability, Rule } from "./Applicatability";
import { is_applicatable } from "./Rule";
/**
 * Class representing the metadata for a generic procedure.
 */
export class GenericProcedureMetadata {
    name: string;
    arity: Int;
    dispatchStore: DispatchStore;
    

    /**
     * Constructs an instance of GenericProcedureMetadata.
     * @param name - The name of the procedure.
     * @param arity - The arity of the procedure.
     * @param metaData - An array of objects containing predicates and handlers.
     * @param defaultHandler - The default handler to use if no predicates match.
     */
    constructor(name: string, arity: Int, metaData: DispatchStore , defaultHandler: (...args: any) => any) {
        this.name          = name;
        this.arity         = arity;
        this.dispatchStore = metaData;
        this.dispatchStore.set_default_handler(defaultHandler)
    }

    /**
     * Adds a handler to the metadata.
     * @param predicate - A function to determine if the handler should be used.
     * @param handler - The handler function to be used if the predicate matches.
     */
    public addHandler(applicability: Applicability, handler: (...args: any) => any): void {
        this.dispatchStore.add_handler(applicability, handler)
    }
}


export const find_matched_rule = (metaData: GenericProcedureMetadata, args: any[]): Rule | undefined => {
    return metaData.dispatchStore.get_all_rules().find(rule => is_applicatable(rule.applicability, args))
}

export const trace_find_matched_rule = (logger: (log: string) => void) => (metaData: GenericProcedureMetadata, args: any[]): Rule | undefined => {
    logger(`[trace] finding rule for ${metaData.name} with args: ${JSON.stringify(args)}`);
    for (const rule of metaData.dispatchStore.get_all_rules()) {
        const applicable = is_applicatable(rule.applicability, args);
        logger(`[trace] rule ${rule.applicability.summary()} applicable: ${applicable}`);
        if (applicable) {
            logger(`[trace] matched rule for ${metaData.name}`);
            return rule;
        }
    }
    logger(`[trace] no rule matched for ${metaData.name}`);
    return undefined;
}


export const get_handler = (rule: Rule): (...args: any) => any => {
    return rule.handler
}

export const trace_get_handler = (logger: (log: string) => void) => (rule: Rule): (...args: any) => any => {
    return (...args: any[]) => {
        logger(`[trace] invoking handler ${rule.handler.name || "anonymous"} with args: ${JSON.stringify(args)}`);
        const result = rule.handler(...args);
        logger(`[trace] handler ${rule.handler.name || "anonymous"} result: ${JSON.stringify(result)}`);
        return result;
    };
}