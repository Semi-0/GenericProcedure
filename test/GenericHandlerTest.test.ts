import { construct_simple_generic_procedure, define_generic_procedure_handler } from '../GenericProcedure';
import {test, expect, describe, beforeEach, mock, jest} from "bun:test";
describe('generic_procedure', () => {
 
    const defaultHandler = jest.fn(args => "default response");

    const testFunc = construct_simple_generic_procedure("testFunc", 1, defaultHandler);
    
    beforeEach(() => {
        jest.clearAllMocks();  // Clear mocks before each test
    });

    test('should execute default handler if no specific handler matches', () => {
        const result = testFunc(42);
        expect(defaultHandler).toHaveBeenCalledWith(42);
        expect(result).toBe("default response");
    });

    test('should execute specific handler when predicate matches', () => {
        const specificHandler = jest.fn((...args) => "specific response");
        const predicate = jest.fn((...args) => args[0] === 42);
        define_generic_procedure_handler(testFunc, predicate, specificHandler);

        const result = testFunc(42);
        expect(predicate).toHaveBeenCalledWith(42);
        expect(specificHandler).toHaveBeenCalledWith(42);
        expect(result).toBe("specific response");
    });

    // Testing multiple functions
    test('should handle multiple functions with different predicates', () => {
        const anotherFunc = construct_simple_generic_procedure("anotherFunc", 1, defaultHandler);
        const specificHandler1 = jest.fn((...args) => "response from handler 1");
        const specificHandler2 = jest.fn((...args) => "response from handler 2");

        const predicate1 = jest.fn((...args) => args[0] < 50);
        const predicate2 = jest.fn((...args) => args[0] >= 50);

        define_generic_procedure_handler(anotherFunc, predicate1, specificHandler1);
        define_generic_procedure_handler(anotherFunc, predicate2, specificHandler2);

        const result1 = anotherFunc(30);
        const result2 = anotherFunc(60);

        expect(predicate1).toHaveBeenCalledWith(30);
        expect(specificHandler1).toHaveBeenCalledWith(30);
        expect(result1).toBe("response from handler 1");

        expect(predicate2).toHaveBeenCalledWith(60);
        expect(specificHandler2).toHaveBeenCalledWith(60);
        expect(result2).toBe("response from handler 2");
    });

});
