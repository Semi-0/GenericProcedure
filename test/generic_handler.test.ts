import { construct_simple_generic_procedure, define_generic_procedure_handler } from '../GenericProcedure';
import {test, expect, describe, beforeEach, mock, jest} from "bun:test";

import { register_predicate, execute_predicate, get_predicate,  match_args, clear_predicate_store } from '../Predicates';


describe('Predicates', () => {
    beforeEach(() => {
        // Clear the predicates store before each test
        clear_predicate_store()
    });

    test('should add and retrieve a predicate', () => {
        const predicate = (arg: any) => arg === 42;
        register_predicate('testPredicate', predicate);

        const retrievedPredicate = get_predicate('testPredicate');
        expect(retrievedPredicate).toBeDefined();
        if (retrievedPredicate){
            expect(retrievedPredicate(42)).toBe(true);
            expect(retrievedPredicate(43)).toBe(false);
        }
        else{
            throw new Error("Predicate not found");
        }
    });

    test('should execute a predicate', () => {
        
        const predicate = register_predicate('testPredicate', jest.fn((arg: any) => arg === 42) );

        const result1 = execute_predicate('testPredicate', 42);
        const result2 = execute_predicate('testPredicate', 42);

        expect(result1).toBe(true);
        expect(result2).toBe(true);
        expect(predicate).toHaveBeenCalledTimes(2); // No caching, so it's called twice
    });

    test('should throw an error if predicate not found', () => {
        expect(() => execute_predicate('nonExistentPredicate', 42)).toThrow('Predicate nonExistentPredicate not found');
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
        const predicate = register_predicate('testPredicate', jest.fn((...args) => args[0] === 42) );
        define_generic_procedure_handler(testFunc, match_args(predicate), specificHandler);

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

        const predicate1 = register_predicate('testPredicate1', jest.fn((...args) => args[0] < 50) );
        const predicate2 = register_predicate('testPredicate2', jest.fn((...args) => args[0] >= 50) );

        define_generic_procedure_handler(anotherFunc, match_args(predicate1), specificHandler1);
        define_generic_procedure_handler(anotherFunc, match_args(predicate2), specificHandler2);

        const result1 = anotherFunc(30);
        const result2 = anotherFunc(60);

        expect(predicate1).toHaveBeenCalledWith(30);
        expect(specificHandler1).toHaveBeenCalledWith(30);
        expect(result1).toBe("response from handler 1");

        expect(predicate2).toHaveBeenCalledWith(60);
        expect(specificHandler2).toHaveBeenCalledWith(60);
        expect(result2).toBe("response from handler 2");
    });

    test('should execute the most recently added handler when multiple handlers match', () => {
        const testFunc = construct_simple_generic_procedure("testFunc", 1, defaultHandler);
        
        const handler1 = jest.fn(() => "response from handler 1");
        const handler2 = jest.fn(() => "response from handler 2");
        
        const predicate1 = register_predicate('testPredicate1', jest.fn(() => true) );  // This will always match
        const predicate2 = register_predicate('testPredicate2', jest.fn(() => true) );  // This will also always match
        
        define_generic_procedure_handler(testFunc, match_args(predicate1), handler1);
        define_generic_procedure_handler(testFunc, match_args(predicate2), handler2);
        
        const result = testFunc(42);
        
        expect(predicate2).toHaveBeenCalledWith(42);
        expect(predicate1).not.toHaveBeenCalled();  // The second predicate should prevent this from being called
        expect(handler2).toHaveBeenCalledWith(42);
        expect(handler1).not.toHaveBeenCalled();
        expect(result).toBe("response from handler 2");
    });
});