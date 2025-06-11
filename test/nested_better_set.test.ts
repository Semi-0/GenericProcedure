import {
  BetterSet,
  construct_better_set,
  set_filter,
  set_map,
  set_get_length,
  is_better_set,
  set_for_each,
  get_value,
  to_array
} from '../built_in_generics/generic_better_set';

import { describe, test, expect } from 'bun:test';

describe('Nested BetterSet Operations', () => {
  test('construct nested BetterSet with arrays creates valid nested sets', () => {
    const simpleNestedData = [1, [2, 3], 4];
    const nestedSet = construct_better_set(simpleNestedData);
    
    expect(is_better_set(nestedSet)).toBe(true);
    expect(set_get_length(nestedSet)).toBe(3);
    
    // Check that the nested array became a BetterSet
    const array = to_array(nestedSet);
    let foundNestedSet = false;
    array.forEach(item => {
      if (is_better_set(item)) {
        foundNestedSet = true;
        expect(set_get_length(item as unknown as BetterSet<any>)).toBe(2);
      }
    });
    expect(foundNestedSet).toBe(true);
  });

  test('mapping preserves BetterSet validity', () => {
    const set = construct_better_set([1, 2, 3]);
    const mapped = set_map(set, x => x * 2);
    
    expect(is_better_set(mapped)).toBe(true);
    expect(set_get_length(mapped)).toBe(3);
    
    const values = to_array(mapped);
    expect(values.sort()).toEqual([2, 4, 6]);
  });

  test('filtering preserves BetterSet validity', () => {
    const set = construct_better_set([1, 2, 3, 4, 5]);
    const filtered = set_filter(set, x => x % 2 === 0);
    
    expect(is_better_set(filtered)).toBe(true);
    expect(set_get_length(filtered)).toBe(2);
    
    const values = to_array(filtered);
    expect(values.sort()).toEqual([2, 4]);
  });

  test('for_each works correctly on BetterSets', () => {
    const set = construct_better_set([1, 2, 3]);
    const collected: number[] = [];
    
    set_for_each(value => {
      collected.push(value as number);
    }, set);
    
    expect(collected.length).toBe(3);
    expect(collected.sort()).toEqual([1, 2, 3]);
  });

  test('get_value retrieves correct values', () => {
    const set = construct_better_set([10, 20, 30]);
    const array = to_array(set);
    
    for (let i = 0; i < set_get_length(set); i++) {
      const value = get_value(set, i);
      expect(array).toContain(value);
    }
  });

  test('nested set operations with simple structure', () => {
    // Create a simple nested structure
    const innerSet = construct_better_set([1, 2]);
    const outerSet = construct_better_set([innerSet, 3]);
    
    expect(is_better_set(outerSet)).toBe(true);
    expect(set_get_length(outerSet)).toBe(2);
    
    // Find the nested set
    const values = to_array(outerSet);
    let nestedSetFound = false;
    values.forEach(value => {
      if (is_better_set(value)) {
        nestedSetFound = true;
        expect(set_get_length(value as unknown as BetterSet<any>)).toBe(2);
      }
    });
    expect(nestedSetFound).toBe(true);
  });
}); 