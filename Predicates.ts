// TODO: ADD STORE FOR PREDICATES
class PredicateProcedure{
    procedure: (arg: any) => boolean
    cache: Map<any, boolean>
    constructor(procedure: (arg: any) => boolean, cache: Map<any, boolean>){
        this.procedure = procedure
        this.cache = cache
    }
}

const predicatesStore = new Map<string, PredicateProcedure>()

export function execute_procedure(arg: any, proc: PredicateProcedure){
    if (proc.cache.has(arg)){
        return proc.cache.get(arg)
    }
    else{
        const result = proc.procedure(arg)
        proc.cache.set(arg, result)
        return result
    }
}

export function construct_procedure(proc: (arg: any) => boolean){
    return new PredicateProcedure(proc, new Map())
}

export function add_predicate(name: string, predicate: (args: any) => boolean){
    predicatesStore.set(name, construct_procedure(predicate))
}

export function get_predicate(name: string): PredicateProcedure | undefined{
    if (!predicatesStore.has(name)){
        throw new Error(`Predicate ${name} not found`)
    }
    return predicatesStore.get(name)
} 

export function execute_predicate(name: string, args: any){
    const predicate = get_predicate(name)
    if (!predicate){
        throw new Error(`Predicate ${name} not found`)
    }
    return execute_procedure(args, predicate)
}

function match_args(predicates: PredicateProcedure[]): (...args: any) => boolean{
    return (...args: any) => {
       if(predicates.length !== args.length){
        throw new Error("Predicates and arguments length mismatch", { cause: { predicates, args } })
       }
       else{
        return predicates.every((predicate, index) => execute_procedure(args[index], predicate))
       }
    }
}
