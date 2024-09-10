import { generic_wrapper } from "./generic_wrapper";

function construct_advice(input_modifiers: ((arg: any) => any)[], output_modifier: (result: any) => any) {
    return ["advice", input_modifiers, output_modifier]
}

function is_advice(x: any): boolean {
    return Array.isArray(x) && x[0] === "advice";
}

function get_input_modifiers(advice: any): ((...args: any[]) => any)[] {
    return advice[1];
}

function get_output_modifier(advice: any): (result: any) => any {
    return advice[2];
}

function install_advices(advices: any[], functionToWrap: (...args: any[]) => any) {

    // reverse would make the execution very slow, so i dont reverse the advices
    return advices.reverse().reduce((acc, advice) => install_advice(advice, acc), functionToWrap);
}

function install_advice(advice: any, functionToWrap: (...args: any[]) => any) {
        return generic_wrapper(functionToWrap, get_output_modifier(advice), ...get_input_modifiers(advice))
}


export { construct_advice, is_advice, get_input_modifiers, get_output_modifier, install_advices, install_advice };