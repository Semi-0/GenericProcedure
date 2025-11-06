import { Applicability } from "./Applicatability"
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
        return "applicability: " + this.applicability.summary() + " handler: " + this.handler.toString()
    } 

    summary_with_args(...args: any){
        return "applicability: " + this.applicability.summary_with_args(...args) + "handler: " + this.handler.toString()
    }
}

export const is_applicatable = (applicability: Applicability, args: any[]) => {
    return applicability.execute(...args)
}



