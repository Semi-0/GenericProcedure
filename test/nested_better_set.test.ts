import {
  BetterSet,
  construct_better_set,
  set_add_item,
  set_filter,
  map_to_new_set,
  set_map,
  to_array,
  make_multi_dimensional_set,
  set_flat_map,
  get_value,
  set_get_length,
  is_better_set,
  set_reduce,
  set_union,
  set_for_each,
  do_operation
} from '../built_in_generics/generic_better_set';

import { describe, test, expect } from 'bun:test';

// Utility function to check if an object is a valid BetterSet
function validateBetterSet(set: any, label: string) {
  const hasMetaData = set.meta_data !== undefined;
  const hasIdentifyBy = set.identify_by !== undefined;
  const hasCopyMethod = set.copy !== undefined && typeof set.copy === 'function';
  
  expect(hasMetaData).toBe(true, `${label}: Missing meta_data property`);
  expect(hasIdentifyBy).toBe(true, `${label}: Missing identify_by property`);
  expect(hasCopyMethod).toBe(true, `${label}: Missing copy method`);
  expect(is_better_set(set)).toBe(true, `${label}: Failed is_better_set predicate check`);
  
  // Additional validations to ensure it behaves like a BetterSet
  try {
    const copied = set.copy();
    expect(is_better_set(copied)).toBe(true, `${label}: Copy method doesn't return a valid BetterSet`);
  } catch (e) {
    throw new Error(`${label}: Exception when calling copy method: ${e}`);
  }
}

describe('Deep Nested BetterSet Operations', () => {
  // Create a deeply nested structure for testing
  const createDeepNestedSet = () => {
    // First create a complex nested array structure
    const nestedData = [
      1,
      [2, 3],
      [4, [5, 6]],
      [7, [8, [9, 10]]]
    ];
    
    // Convert to a multi-dimensional BetterSet
    return make_multi_dimensional_set(nestedData);
  };

  test('deeply nested BetterSet retains validity at all levels', () => {
    const deepSet = createDeepNestedSet();
    
    // Validate the root set
    validateBetterSet(deepSet, 'Root set');
    
    // Validate first level nested sets
    for (let i = 1; i < set_get_length(deepSet); i++) {
      const nestedSet = get_value(deepSet, i);
      validateBetterSet(nestedSet, `First level nested set at index ${i}`);
      
      // Check for deeper nesting if it exists
      if (set_get_length(nestedSet) > 0) {
        for (let j = 0; j < set_get_length(nestedSet); j++) {
          const value = get_value(nestedSet, j);
          if (is_better_set(value)) {
            validateBetterSet(value, `Second level nested set at index ${i}.${j}`);
            
            // Check for third level nesting
            if (set_get_length(value) > 0) {
              for (let k = 0; k < set_get_length(value); k++) {
                const deepValue = get_value(value, k);
                if (is_better_set(deepValue)) {
                  validateBetterSet(deepValue, `Third level nested set at index ${i}.${j}.${k}`);
                }
              }
            }
          }
        }
      }
    }
  });

  test('mapping deep nested sets preserves validity', () => {
    const deepSet = createDeepNestedSet();
    
    // Map operation on the root level
    const mappedRoot = set_map(deepSet, value => {
      // If the value is a BetterSet, return it unchanged, otherwise multiply by 2
      if (is_better_set(value)) {
        return value;
      }
      return (value as number) * 2;
    });
    
    validateBetterSet(mappedRoot, 'Mapped root set');
    
    // Map operation that creates a completely new structure
    const complexMap = set_map(deepSet, value => {
      if (is_better_set(value)) {
        // Apply mapping to each nested set
        return set_map(value, nestedValue => {
          if (is_better_set(nestedValue)) {
            // Map one more level deep
            return set_map(nestedValue, deepValue => 
              is_better_set(deepValue) ? deepValue : (deepValue as number) * 3);
          }
          return (nestedValue as number) * 2;
        });
      }
      return value;
    });
    
    validateBetterSet(complexMap, 'Complex mapped set');
    
    // Validate all levels of the complex mapped structure
    for (let i = 0; i < set_get_length(complexMap); i++) {
      const firstLevel = get_value(complexMap, i);
      if (is_better_set(firstLevel)) {
        validateBetterSet(firstLevel, `First level after complex map at index ${i}`);
        
        for (let j = 0; j < set_get_length(firstLevel); j++) {
          const secondLevel = get_value(firstLevel, j);
          if (is_better_set(secondLevel)) {
            validateBetterSet(secondLevel, `Second level after complex map at index ${i}.${j}`);
          }
        }
      }
    }
  });

  test('filtering deep nested sets preserves validity', () => {
    const deepSet = createDeepNestedSet();
    
    // Filter operation on the root level
    const filteredRoot = set_filter(deepSet, value => {
      if (is_better_set(value)) {
        return true; // Keep all nested sets
      }
      return (value as number) % 2 === 0; // Keep only even numbers
    });
    
    validateBetterSet(filteredRoot, 'Filtered root set');
    
    // Complex nested filtering
    const complexFiltered = set_map(deepSet, value => {
      if (is_better_set(value)) {
        // Filter each nested set
        return set_filter(value, nestedValue => {
          if (is_better_set(nestedValue)) {
            // Apply another filter at deeper level
            return true; // Keep all deeper BetterSets
          }
          return (nestedValue as number) > 5; // Only keep numbers > 5
        });
      }
      return value;
    });
    
    validateBetterSet(complexFiltered, 'Complex filtered set');
    
    // Validate the structure after complex filtering
    for (let i = 0; i < set_get_length(complexFiltered); i++) {
      const firstLevel = get_value(complexFiltered, i);
      if (is_better_set(firstLevel)) {
        validateBetterSet(firstLevel, `First level after complex filter at index ${i}`);
        
        for (let j = 0; j < set_get_length(firstLevel); j++) {
          const secondLevel = get_value(firstLevel, j);
          if (is_better_set(secondLevel)) {
            validateBetterSet(secondLevel, `Second level after complex filter at index ${i}.${j}`);
          }
        }
      }
    }
  });

  test('flat_map operations on nested sets preserves validity', () => {
    const deepSet = createDeepNestedSet();
    
    // Simple flat_map that should flatten one level
    const flatMapped = set_flat_map(deepSet, value => {
      if (is_better_set(value)) {
        return value; // Return the nested set directly
      }
      // For numbers, create a new set with the number and its double
      return construct_better_set([value, (value as number) * 2], v => v.toString());
    });
    
    validateBetterSet(flatMapped, 'Flat mapped set');
    
    // Complex case with multiple flat_map operations
    const nestedFlatMap = set_map(deepSet, value => {
      if (is_better_set(value)) {
        // Apply flat_map to each nested set
        return set_flat_map(value, nestedValue => {
          if (is_better_set(nestedValue)) {
            return nestedValue;
          }
          return construct_better_set([nestedValue], v => v.toString());
        });
      }
      return value;
    });
    
    validateBetterSet(nestedFlatMap, 'Nested flat mapped set');
    
    // Validate the structure after nested flat_mapping
    for (let i = 0; i < set_get_length(nestedFlatMap); i++) {
      const firstLevel = get_value(nestedFlatMap, i);
      if (is_better_set(firstLevel)) {
        validateBetterSet(firstLevel, `First level after nested flat_map at index ${i}`);
      }
    }
  });

  test('chained operations preserve BetterSet validity', () => {
    const deepSet = createDeepNestedSet();
    
    // Chain multiple operations that might break the BetterSet
    const result = set_flat_map(
      set_map(
        set_filter(deepSet, value => 
          is_better_set(value) || (value as number) > 3
        ),
        value => is_better_set(value) ? value : (value as number) * 2
      ),
      value => {
        if (is_better_set(value)) {
          return set_filter(value, v => 
            is_better_set(v) || (v as number) % 2 === 0
          );
        }
        return construct_better_set([value], v => v.toString());
      }
    );
    
    validateBetterSet(result, 'Result after chained operations');
    
    // Check all values in the result
    for (let i = 0; i < set_get_length(result); i++) {
      const value = get_value(result, i);
      if (is_better_set(value)) {
        validateBetterSet(value, `Nested value at index ${i} after chained operations`);
      }
    }
  });

  // Added new edge case tests
  test('edge case: empty set handling in nested operations', () => {
    // Create an empty set
    const emptySet = construct_better_set([], (x) => x.toString());
    validateBetterSet(emptySet, 'Empty set');
    
    // Create a nested set with empty sets
    const nestedWithEmpty = make_multi_dimensional_set([
      emptySet,
      [1, emptySet],
      [emptySet, [2, 3]]
    ]);
    validateBetterSet(nestedWithEmpty, 'Nested set with empty sets');
    
    // Perform operations on the nested set with empties
    const mapped = set_map(nestedWithEmpty, value => {
      if (is_better_set(value)) {
        if (set_get_length(value) === 0) {
          // Replace empty sets with a new set containing a single value
          return construct_better_set([999], x => x.toString());
        }
        return value;
      }
      return value;
    });
    
    validateBetterSet(mapped, 'Mapped set with empty set replacements');
  });
  
  test('edge case: do_operation direct usage', () => {
    const baseSet = construct_better_set([1, 2, 3], x => x.toString());
    
    // Use do_operation directly, which is more low-level
    const transformed = do_operation(
      baseSet,
      metaData => {
        const newMap = new Map();
        metaData.forEach((value, key) => {
          newMap.set(key + '_modified', (value as number) * 10);
        });
        return newMap;
      },
      (x) => x.toString()
    );
    
    validateBetterSet(transformed, 'Directly transformed set with do_operation');
  });
  
  test('edge case: multiple operations with manual set creation', () => {
    // Start with a simple set
    const simpleSet = construct_better_set([1, 2, 3], x => x.toString());
    
    // Create a more complex nested structure manually
    const level3 = construct_better_set([8, 9], x => x.toString());
    const level2 = construct_better_set([6, 7, level3], x => x.toString());
    const level1 = construct_better_set([4, 5, level2], x => x.toString());
    const rootSet = construct_better_set([simpleSet, level1], x => x.toString());
    
    validateBetterSet(rootSet, 'Manually constructed nested set');
    
    // Try a complex set of operations
    let result = rootSet;
    
    // Perform multiple operations
    for (let i = 0; i < 5; i++) {
      result = set_map(result, value => {
        if (is_better_set(value)) {
          // Apply a nested operation recursively
          return set_map(value, innerVal => {
            if (is_better_set(innerVal)) {
              return innerVal;
            }
            return (innerVal as number) + 1;
          });
        }
        return value;
      });
      
      validateBetterSet(result, `Result after iteration ${i}`);
    }
  });
  
  test('edge case: for_each and mutation', () => {
    const deepSet = createDeepNestedSet();
    
    // Try to create an array of all the sets
    const allSets: any[] = [];
    
    const collectSets = (set: any) => {
      if (is_better_set(set)) {
        allSets.push(set);
        set_for_each(value => {
          if (is_better_set(value)) {
            collectSets(value);
          }
        }, set);
      }
    };
    
    collectSets(deepSet);
    
    // Validate all collected sets
    allSets.forEach((set, index) => {
      validateBetterSet(set, `Collected set at index ${index}`);
    });
    
    // Now try some operations on the collected sets
    const results = allSets.map(set => {
      return set_map(set, val => {
        if (is_better_set(val)) {
          return val;
        }
        return (val as number) * 2;
      });
    });
    
    results.forEach((result, index) => {
      validateBetterSet(result, `Result from collected set ${index}`);
    });
  });
  
  test('edge case: recursive mapping with union operations', () => {
    const deepSet = createDeepNestedSet();
    
    // Create a recursive mapping function that also does unions
    const recursiveMapWithUnion = (set: any): any => {
      if (!is_better_set(set)) {
        return set;
      }
      
      // Map and potentially create unions
      return set_map(set, value => {
        if (is_better_set(value)) {
          const mappedInner = recursiveMapWithUnion(value);
          
          // Sometimes do a union operation
          if (set_get_length(mappedInner) > 0) {
            const firstVal = get_value(mappedInner, 0);
            if (!is_better_set(firstVal)) {
              // Create a union to test nested union operations
              return set_union(mappedInner, construct_better_set([999], x => x.toString()));
            }
          }
          
          return mappedInner;
        }
        return (value as number) * 2;
      });
    };
    
    const result = recursiveMapWithUnion(deepSet);
    validateBetterSet(result, 'Result of recursive mapping with unions');
    
    // Check all values in the result
    const validateRecursively = (set: any, path: string) => {
      validateBetterSet(set, `Set at path ${path}`);
      
      for (let i = 0; i < set_get_length(set); i++) {
        const value = get_value(set, i);
        if (is_better_set(value)) {
          validateRecursively(value, `${path}.${i}`);
        }
      }
    };
    
    validateRecursively(result, 'root');
  });
}); 