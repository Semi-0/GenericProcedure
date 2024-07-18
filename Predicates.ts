// TODO: PREDICATE CAN BE MORE EFFICIENT WITH A_TRIE & INTEGRATION INTO GENERIC STORE



import { SimpleDispatchStore } from './DispatchStore';

export class PredicateStore {
    private store: SimpleDispatchStore = new SimpleDispatchStore();
    private predicateNames: Set<string> = new Set();

    clear() {
        this.store = new SimpleDispatchStore();
        this.predicateNames.clear();
    } 

    register(name: string, predicate: (args: any) => boolean) {
        this.store.add_handler(
            (args) => args === name,
            (args) => predicate(args)
        );
        this.predicateNames.add(name);
    }

    get(name: string): (arg: any) => boolean {
        const handler = this.store.get_handler(name);
        if (!handler) {
            throw new Error(`Predicate ${name} not found`);
        }
        return handler;
    }

    execute(name: string, args: any) {
        return this.get(name)(args);
    }

    get_all_predicates() {
        return Array.from(this.predicateNames);
    }

    display_all() {
        console.log(this.get_all_predicates());
    }

    search(name: string) {
        const result = this.get_all_predicates()
            .filter(predicate => predicate.includes(name))
            .sort();
        console.log(result);
    }
}

let defaultPredicateStore = new PredicateStore();

export function get_default_predicate_store() {
    return defaultPredicateStore;
}

export function set_default_predicate_store(store: PredicateStore) {
    defaultPredicateStore = store;
}

export function clear_predicate_store() {
    defaultPredicateStore.clear();
}

export function register_predicate(name: string, predicate: (args: any) => boolean) {
    defaultPredicateStore.register(name, predicate);
}

export function get_predicate(name: string): ((arg: any) => boolean) | undefined {
    return defaultPredicateStore.get(name);
}

export function get_predicates() {
    return defaultPredicateStore.get_all_predicates();
}

export function filter_predicates(predicate: (name: string) => boolean) {
    return defaultPredicateStore.get_all_predicates().filter(predicate);
}

export function execute_predicate(name: string, args: any) {
    return defaultPredicateStore.execute(name, args);
}

export function display_all_predicates() {
    defaultPredicateStore.display_all();
}

export function search_predicate(name: string) {
    defaultPredicateStore.search(name);
}

export function match_preds(predicates: string[]): (...args: any) => boolean{
    return (...args: any) => {
       if(predicates.length !== args.length){
        throw new Error("Predicates and arguments length mismatch", { cause: { predicates, args } })
       }
       else{
        return predicates.every((predicate, index) => execute_predicate(predicate, args[index]))
       }
    }
}

export function match_args(arg_critics: ((arg: any) => boolean)[]): (...args: any) => boolean{
    return (...args: any) => args.every((arg, index) => arg_critics[index](arg))
}