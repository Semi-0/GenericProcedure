import { construct_simple_generic_procedure, define_generic_procedure_handler } from '../GenericProcedure';
import {test, expect, describe, beforeEach, mock, jest} from "bun:test";

import { add_predicate, execute_predicate, get_predicate, construct_procedure, match_args, clear_predicate_store } from '../Predicates';


describe('Predicates', () => {
    beforeEach(() => {
        // Clear the predicates store before each test
        clear_predicate_store()
    });

    test('should add and retrieve a predicate', () => {
        const predicate = (arg: any) => arg === 42;
        add_predicate('testPredicate', predicate);

        const retrievedPredicate = get_predicate('testPredicate');
        expect(retrievedPredicate).toBeDefined();
        expect(retrievedPredicate?.procedure(42)).toBe(true);
        expect(retrievedPredicate?.procedure(43)).toBe(false);
    });

    test('should execute a predicate and cache the result', () => {
        const predicate = jest.fn((arg: any) => arg === 42);
        add_predicate('testPredicate', predicate);

        const result1 = execute_predicate('testPredicate', 42);
        const result2 = execute_predicate('testPredicate', 42);

        expect(result1).toBe(true);
        expect(result2).toBe(true);
        expect(predicate).toHaveBeenCalledTimes(1); // Should be called only once due to caching
    });

    test('should throw an error if predicate not found', () => {
        expect(() => execute_predicate('nonExistentPredicate', 42)).toThrow('Predicate nonExistentPredicate not found');
    });

    test('should match arguments with predicates', () => {
        const predicate1 = (arg: any) => arg === 42;
        const predicate2 = (arg: any) => arg === 'test';

        const proc1 = construct_procedure(predicate1);
        const proc2 = construct_procedure(predicate2);

        const match = match_args([proc1, proc2]);

        expect(match(42, 'test')).toBe(true);
        expect(match(42, 'fail')).toBe(false);
        expect(match(41, 'test')).toBe(false);
    });

    test('should throw an error if predicates and arguments length mismatch', () => {
        const predicate1 = (arg: any) => arg === 42;
        const proc1 = construct_procedure(predicate1);

        const match = match_args([proc1]);

        expect(() => match(42, 'extraArg')).toThrow('Predicates and arguments length mismatch');
    });
});

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
