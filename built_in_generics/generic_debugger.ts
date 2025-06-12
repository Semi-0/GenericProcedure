import { to_string } from "./generic_conversation"

export function trace_function(logger: (log: string) => void){

    return (name: string, f: (...args: any[]) => any) => {
        return (...args: any[]) => {
            logger(name + " called with args: " +  to_string(args) + "\n")
            const result = f(...args)
            logger(name + " returned: " +  to_string(result) + "\n")
            return result
        }
    }
}

export function log_tracer(name: string, f: (...args: any[]) => any){
    return trace_function(console.log)(name, f)
}