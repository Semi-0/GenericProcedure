import { Applicability } from "./Applicatability"
import { Rule } from "./Rule"
import * as CryptoJS from 'crypto-js';
import { Trie } from "./Trie";

export interface DispatchStore{
   
    get_handler: (...args: any) => ((...args: any) => any) | null
    add_handler: (applicability: Applicability, handler: (...args: any) => any) => void
    remove_handler: (applicability: Applicability) => void
    get_default_handler: () => ((...args: any) => any)
    set_default_handler: (handler: (...args: any) => any) => void
    summary_rules: (...args: any) => string[],
    summary_rules_with_args: (...args: any[]) => string[]
}


export class SimpleDispatchStore implements DispatchStore{

    private rules: Rule[] = []
    private defaultHandler: (...args: any) => any = (...args: any) => {
        console.log('No handler found for action', args)
    }

    constructor(){}

    summary_rules(): string[]{
        return this.rules.map(rule => rule.summary())
    }
    // for debugging
    summary_rules_with_args(...args: any[]) :string[]{
        return this.rules.map(rule => rule.summary_with_args(...args))
    }

    get_handler(...args: any) : ((...args: any) => any) | null {
       const rule = this.rules.find(rule => rule.applicability.execute(...args))
       if(rule){
        return rule.handler
       }
       else{
        return null
       }
    }

    add_handler(applicability: Applicability, handler: (...args: any) => any){
        const existed = this.rules.find(rule => rule.applicability.equals(applicability))
        if(existed){
            existed.set_handler(handler)
        }
        else{
            this.rules.unshift(new Rule(applicability, handler))
        }
    }

    remove_handler(applicability: Applicability){
        this.rules = this.rules.filter(rule => !rule.applicability.equals(applicability))
    }

    get_default_handler(){
        return this.defaultHandler
    }

    set_default_handler(handler: (...args: any) => any){
        this.defaultHandler = handler
    }
}



export class CachedDispatchStore extends SimpleDispatchStore {
    private cache: Map<string, any> = new Map();
    
    private hashValue(value: any): string {
        const stringValue = JSON.stringify(value);
        const hash = CryptoJS.SHA256(stringValue);
        return hash.toString(CryptoJS.enc.Hex);
    }

    get_handler(...args: any): ((...args: any) => any) | null {
        const hashKey = this.hashValue(args);
        if (this.cache.has(hashKey)) {
            return this.cache.get(hashKey);
        }

        const handler = super.get_handler(...args);
        if (handler) {
            this.cache.set(hashKey, handler);
        }
        return handler;
    }

    add_handler(applicability: Applicability, handler: (...args: any) => any) {
        super.add_handler(applicability, handler);
        this.cache.clear(); // Clear cache when a new handler is added
    }

    remove_handler(applicability: Applicability) {
        super.remove_handler(applicability);
        this.cache.clear(); // Clear cache when a handler is removed
    }
}


// export class PersistentLocalCachedDispatchStore extends SimpleDispatchStore {
//     private mongoClient: MongoClient;
//     private db: any;
//     private collection: any;

//     constructor() {
//         super();
//         this.mongoClient = new MongoClient('mongodb://localhost:27017');
//         this.mongoClient.connect().then(() => {
//             this.db = this.mongoClient.db('dispatchStore');
//             this.collection = this.db.collection('cache');
//         });
//     }

//     private async hashValue(value: any): Promise<string> {
//         const stringValue = JSON.stringify(value);
//         const hash = CryptoJS.SHA256(stringValue);
//         return hash.toString(CryptoJS.enc.Hex);
//     }

//     async get_handler(...args: any): Promise<((...args: any) => any) | null> {
//         const hashKey = await this.hashValue(args);
//         const cachedHandler = await this.collection.findOne({ hashKey });
//         if (cachedHandler) {
//             return cachedHandler.handler;
//         }

//         const handler = super.get_handler(...args);
//         if (handler) {
//             await this.collection.insertOne({ hashKey, handler });
//         }
//         return handler;
//     }

//     async add_handler(applicability: Applicability, handler: (...args: any) => any) {
//         await super.add_handler(applicability, handler);
//         await this.collection.deleteMany({}); // Clear cache when a new handler is added
//     }

//     async remove_handler(applicability: Applicability) {
//         await super.remove_handler(applicability);
//         await this.collection.deleteMany({}); // Clear cache when a handler is removed
//     }
// }


// // export class TrieDispatchStore extends SimpleDispatchStore{
// //     private trie: Trie

// //     constructor(){
// //         super()
// //         this.trie = new Trie()
// //     }

// //     add_handler(applicability: Applicability, handler: (...args: any) => any): void {
// //         super.add_handler(applicability, handler)
// //         this.trie.set([applicability.name,  ...applicability.predicates.map(predicate => predicate.name)], handler)
// //     }

// //     get_handler(...args: any): ((...args: any) => any) | null {
// //         const hashKey = this.hashValue(args);
// //         if (this.cache.has(hashKey)) {
// //             return this.cache.get(hashKey);
// //         }
// //     }
// // }

