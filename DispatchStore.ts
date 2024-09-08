import { Applicability } from "./Applicatability"
import { Rule } from "./Rule"







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