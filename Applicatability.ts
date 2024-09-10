import { Predicate } from "./Predicates"

export class Applicability{
    readonly name: string
    readonly predicates: Predicate[]
    readonly procedure: (predicates: Predicate[]) => ((...args: any) => boolean)

    constructor(name: string, predicates: Predicate[], procedure: (predicates: Predicate[]) => ((...args: any) => boolean)){
        this.name = name
        this.predicates = predicates
        this.procedure = procedure
    } 

    execute(...args: any[]){
        return this.procedure(this.predicates)(...args)
    }

    summary(){
        return  this.name + " predicates: " + this.predicates.map(p => p.summary()).join(", ")
    }

    summary_with_args(...args: any){
        return  this.name + " predicates: " + "\n" + this.predicates.map(p => p.summary_with_args(...args)).join("\n") + "\n"
    }

    equals(other: Applicability){
        return this.name === other.name && this.predicates.length === other.predicates.length && this.predicates.every((p, i) => p.equals(other.predicates[i]))
    }

}


export class Rule{
    applicability: Applicability
    handler: (...args: any) => any

    constructor(applicability: Applicability, handler: (...args: any) => any){
        this.applicability = applicability
        this.handler = handler
    }

    set_handler(handler: (...args: any) => any){
        this.handler = handler
    }

    set_applicability(applicability: Applicability){
        this.applicability = applicability
    }

    summary(){
        return "applicability: " + this.applicability.summary + " handler: " + this.handler.toString()
    } 

    summary_with_args(...args: any){
        return "applicability: " + this.applicability.summary_with_args(...args) + "\n" + " \n handler: " + this.handler.toString()
    }

}
