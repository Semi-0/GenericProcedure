import type { Int } from "./types";
import { SimpleDispatchStore } from "./DispatchStore";
import type { DispatchStore } from "./DispatchStore";
import { Applicability } from "./Applicatability";
import { Rule, is_applicatable } from "./Rule";

/**
 * ANSI color codes for terminal output
 */
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
} as const;

/**
 * Creates a colored logger that wraps the base logger with ANSI color codes
 */
export const create_colored_logger = (baseLogger: (log: string) => void): (log: string) => void => {
    return (log: string) => {
        // Colorize trace prefix first (to avoid interfering with other patterns)
        let colored = log.replace(/\[trace\]/g, `${colors.dim}[trace]${colors.reset}`);
        
        // Colorize procedure names (after "for" or "matched rule for")
        colored = colored.replace(/(finding rule for|matched rule for|no rule matched for)\s+(\w+)/g, 
            (_, prefix, name) => `${prefix} ${colors.cyan}${name}${colors.reset}`);
        
        // Colorize args - match JSON.stringify output
        // Match everything after "args: " or "with args: " until end of line or next pattern
        colored = colored.replace(/(with args:|args:)\s*(.+?)(?=\s+applicable:|\s+result:|$)/g, 
            (match, prefix, args) => {
                const trimmed = args.trim();
                // Colorize if it looks like JSON (starts with [ or {) or is a simple value
                if (trimmed.startsWith('[') || trimmed.startsWith('{') || 
                    /^["\d]|^(true|false|null)$/.test(trimmed)) {
                    return `${prefix} ${colors.yellow}${args}${colors.reset}`;
                }
                return match;
            });
        
        // Colorize rule summaries (between "rule " and " applicable:")
        colored = colored.replace(/(rule\s+)(.+?)(\s+applicable:)/g, 
            (_, prefix, summary, suffix) => `${prefix}${colors.magenta}${summary}${colors.reset}${suffix}`);
        
        // Colorize boolean values (true/false) for applicability
        colored = colored.replace(/(applicable:\s*)(true|false)/g, 
            (_, prefix, value) => `${prefix}${value === 'true' ? colors.green : colors.red}${value}${colors.reset}`);
        
        // Colorize handler names
        colored = colored.replace(/(invoking handler|handler)\s+(\w+|anonymous)/g, 
            (_, prefix, name) => `${prefix} ${colors.blue}${name}${colors.reset}`);
        
        // Colorize results (everything after "result: ")
        colored = colored.replace(/(result:\s*)(.+)$/g, 
            (_, prefix, result) => `${prefix}${colors.cyan}${result}${colors.reset}`);
        
        baseLogger(colored);
    };
};
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
    const coloredLogger = create_colored_logger(logger);
    coloredLogger(`[trace] finding rule for ${metaData.name} with args: ${JSON.stringify(args)}`);
    for (const rule of metaData.dispatchStore.get_all_rules()) {
        const applicable = is_applicatable(rule.applicability, args);
        coloredLogger(`[trace] rule ${rule.applicability.summary()} applicable: ${applicable}`);
        if (applicable) {
            coloredLogger(`[trace] matched rule for ${metaData.name}`);
            return rule;
        }
    }
    coloredLogger(`[trace] no rule matched for ${metaData.name}`);
    return undefined;
}


export const get_handler = (rule: Rule): (...args: any) => any => {
    return rule.handler
}

export const trace_get_handler = (logger: (log: string) => void) => (rule: Rule): (...args: any) => any => {
    const coloredLogger = create_colored_logger(logger);
    return  (...args: any[]) => {
        coloredLogger(`[trace] invoking handler ${rule.handler.name || "anonymous"} with args: ${JSON.stringify(args)}`);
        const result = rule.handler(...args);
        coloredLogger(`[trace] handler ${rule.handler.name || "anonymous"} result: ${JSON.stringify(result)}`);
        return result;
    };
}