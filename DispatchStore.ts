export class Rule{
    applicability: (...args: any) => boolean
    handler: (...args: any) => any


    constructor(applicability: (...args: any) => boolean, handler: (...args: any) => any){
        this.applicability = applicability
        this.handler = handler
    }

    set_handler(handler: (...args: any) => any){
        this.handler = handler
    }

    set_applicability(applicability: (...args: any) => boolean){
        this.applicability = applicability
    }
}

export interface DispatchStore{
    get_handler: (...args: any) => ((...args: any) => any) | null
    add_handler: (applicability: (...args: any) => boolean, handler: (...args: any) => any) => void
    remove_handler: (applicability: (...args: any) => boolean) => void
    get_default_handler: () => ((...args: any) => any)
    set_default_handler: (handler: (...args: any) => any) => void
}


export class SimpleDispatchStore implements DispatchStore{

    private rules: Rule[] = []
    private defaultHandler: (...args: any) => any = (...args: any) => {
        console.log('No handler found for action', args)
    }

    constructor(){}

    get_handler(...args: any) : ((...args: any) => any) | null {
       const rule = this.rules.find(rule => rule.applicability(...args))
       if(rule){
        return rule.handler
       }
       else{
        return null
       }
    }

    add_handler(applicability: (...args: any) => boolean, handler: (...args: any) => any){
        const existed = this.rules.find(rule => rule.applicability === applicability)
        if(existed){
            existed.set_handler(handler)
        }
        else{
            this.rules.push(new Rule(applicability, handler))
        }
    }

    remove_handler(applicability: (...args: any) => boolean){
        this.rules = this.rules.filter(rule => rule.applicability !== applicability)
    }

    get_default_handler(){
        return this.defaultHandler
    }

    set_default_handler(handler: (...args: any) => any){
        this.defaultHandler = handler
    }
}