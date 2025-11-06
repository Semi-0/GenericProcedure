import { to_string } from "./generic_conversation"

export function trace_function(logger: (log: string) => void){

    return (name: string, f: (...args: any[]) => any) => {
        return (...args: any[]) => {
            logger("--------------------------------")
            logger(name + " called with args: " +  "\n")
            args.forEach((arg, index) => {
                logger("arg " + index + ": " + "\n")
                logger(to_string(arg) + "\n")
            })
            const result = f(...args)
            logger(name + " returned: " +  to_string(result) + "\n")
            logger("--------------------------------")
            return result
        }
    }
}

export function log_tracer(name: string, f: (...args: any[]) => any){
    return trace_function(console.log)(name, f)
}