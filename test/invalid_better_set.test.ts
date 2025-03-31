import {
  BetterSet,
  construct_better_set,
  set_map,
  is_better_set,
  set_filter,
  set_flat_map,
  set_add_item,
  do_operation,
  set_union
} from '../built_in_generics/generic_better_set';

import { describe, test, expect } from 'bun:test';

describe('Invalid BetterSet Handling', () => {
  // Helper function to create an invalid BetterSet
  const createInvalidSet = (): any => {
    // This looks like a BetterSet but is missing the copy method
    return {
      meta_data: new Map<string, any>([['1', 1], ['2', 2], ['3', 3]]),
      identify_by: (a: any) => a.toString()
      // Missing copy() method!
    };
  };

  // Helper to create another type of invalid set
  const createPartiallyValidSet = (): any => {
    // Has copy but it doesn't return a valid BetterSet
    return {
      meta_data: new Map<string, any>([['1', 1], ['2', 2], ['3', 3]]),
      identify_by: (a: any) => a.toString(),
      copy: () => {
        // Return an object missing identify_by
        return {
          meta_data: new Map<string, any>([['1', 1], ['2', 2], ['3', 3]])
          // Missing identify_by
        };
      }
    };
  };

  test('is_better_set correctly identifies invalid sets', () => {
    const validSet = construct_better_set([1, 2, 3], x => x.toString());
    const invalidSet = createInvalidSet();
    const partiallyValidSet = createPartiallyValidSet();
    
    expect(is_better_set(validSet)).toBe(true);
    expect(is_better_set(invalidSet)).toBe(false);
    expect(is_better_set(partiallyValidSet)).toBe(true); // Initially valid
    expect(is_better_set(partiallyValidSet.copy())).toBe(false); // But copy is invalid
  });

  test('set operations throw errors on invalid sets', () => {
    const invalidSet = createInvalidSet();

    // Basic operations should throw when given invalid sets
    expect(() => set_add_item(invalidSet, 4)).toThrow();
    expect(() => set_map(invalidSet, x => x)).toThrow();
    expect(() => set_filter(invalidSet, x => true)).toThrow();
  });

  test('creating a set with nested invalid sets should throw', () => {
    const invalidSet = createInvalidSet();
    
    // Creating a set with invalid sets should throw
    expect(() => {
      console.log("Attempting to construct a set with an invalid nested set...");
      construct_better_set([1, 2, invalidSet], x => {
        return typeof x === 'object' ? JSON.stringify(x) : String(x);
      });
    }).toThrow('Invalid BetterSet found in values array');
  });

  test('set_union with invalid sets should throw', () => {
    const validSet = construct_better_set([1, 2, 3], x => x.toString());
    const invalidSet = createInvalidSet();
    
    // Union with raw values should work
    const unionWithNumbers = set_union(1, 2);
    expect(is_better_set(unionWithNumbers)).toBe(true);
    
    // Union with an invalid set should throw
    expect(() => set_union(validSet, invalidSet)).toThrow();
  });

  test('do_operation with invalid result', () => {
    const validSet = construct_better_set([1, 2, 3], x => x.toString());
    
    // Using do_operation to create an invalid set
    expect(() => {
      do_operation(
        validSet,
        metaData => {
          // Return a valid Map
          return new Map<string, any>([['1', 1], ['2', 2], ['3', 3]]);
        },
        // But omit the identify_by function to see if it causes issues
        null as any
      );
    }).toThrow();
  });
}); 