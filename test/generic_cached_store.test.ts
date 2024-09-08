import { construct_cached_generic_procedure, define_generic_procedure_handler } from '../GenericProcedure';
import { test, expect, describe, beforeEach, jest } from "bun:test";
import { register_predicate, execute_predicate, get_predicate, match_args, clear_predicate_store } from '../Predicates';
import { get_metaData } from '../GenericStore';

describe('generic_procedure with caching', () => {
    const defaultHandler = jest.fn(args => "default response");

    const testFunc = construct_cached_generic_procedure("testFunc", 1, defaultHandler);
    
    beforeEach(() => {
        jest.clearAllMocks();  // Clear mocks before each test
        clear_predicate_store(); // Clear the predicates store before each test
    });

    test('should execute default handler if no specific handler matches', () => {
        const result = testFunc(42);
        expect(defaultHandler).toHaveBeenCalledWith(42);
        expect(result).toBe("default response");
    });

    test('should execute specific handler when predicate matches and cache the predicate result', () => {
        const specificHandler = jest.fn((...args) => "specific response");
        const predicateFunc = jest.fn((...args) => args[0] === 42);
        const predicate = register_predicate('testPredicate', predicateFunc);
        define_generic_procedure_handler(testFunc, match_args(predicate), specificHandler);

        const result1 = testFunc(42);
        const result2 = testFunc(42);

        expect(predicate).toHaveBeenCalledWith(42);
        expect(specificHandler).toHaveBeenCalledWith(42);
        expect(result1).toBe("specific response");
        expect(result2).toBe("specific response");
        expect(predicateFunc).toHaveBeenCalledTimes(1); // Should be called only once due to caching
    });

    test('should check if the result is cached', () => {
        const specificHandler = jest.fn((...args) => "specific response");
        const predicate_func = jest.fn((...args) => args[0] === 42);
        const predicate = register_predicate('testPredicate', predicate_func);
        define_generic_procedure_handler(testFunc, match_args(predicate), specificHandler);

        const result1 = testFunc(42);
        const result2 = testFunc(42);

        expect(result1).toBe("specific response");
        expect(result2).toBe("specific response");
        expect(predicate_func).toHaveBeenCalledTimes(1); // Should be called only once due to caching

        // Check if the result is cached
        const metaData = get_metaData(testFunc);
        if (metaData) {
            // @ts-ignore
            expect(metaData.dispatchStore.is_cached([42])).toBe(true);
        } else {
            throw new Error("GenericProcedureMetadata not found");
        }
    });

    test('should clear cache when a new handler is added', () => {
        const specificHandler = jest.fn((...args) => "specific response");
        const predicate_func = jest.fn((...args) => args[0] === 42);
        const predicate = register_predicate('testPredicate', predicate_func);
        define_generic_procedure_handler(testFunc, match_args(predicate), specificHandler);

        const result1 = testFunc(42);
        expect(result1).toBe("specific response");
        expect(predicate_func).toHaveBeenCalledTimes(1);


        // Add a new handler
        const newHandler = jest.fn((...args) => "new response");
        define_generic_procedure_handler(testFunc, match_args(predicate), newHandler);

        const result2 = testFunc(42);
        expect(result2).toBe("new response");
        expect(newHandler).toHaveBeenCalledTimes(1);
        expect(predicate_func).toHaveBeenCalledTimes(2); // Should not be called again
    });
});