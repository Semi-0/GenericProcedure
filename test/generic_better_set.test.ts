import {
    BetterSet,
    construct_better_set,
    add,
    remove,
    has,
    merge,
    filter,
    map,
    get_length,
    to_array,
    is_subset_of,
    get_value
  } from '../built_in_generics/generic_better_set';

  import { describe, beforeEach, test, expect } from 'bun:test';
  
  describe('BetterSet', () => {
    const identify_by = (a: number) => a.toString();
    let set: BetterSet<number>;
  
    beforeEach(() => {
      set = construct_better_set([1, 2, 3], identify_by);
    });
  
    test('construct_better_set creates a set with initial values', () => {
      expect(get_length(set)).toBe(3);
      expect(has(set, 1)).toBe(true);
      expect(has(set, 2)).toBe(true);
      expect(has(set, 3)).toBe(true);
    });
  
    test('add adds a new item to the set', () => {
      const newSet = add(set, 4);
      expect(get_length(newSet)).toBe(4);
      expect(has(newSet, 4)).toBe(true);
    });
  
    test('remove removes an item from the set', () => {
      const newSet = remove(set, 2);
      expect(get_length(newSet)).toBe(2);
      expect(has(newSet, 2)).toBe(false);
    });
  
    test('merge combines two sets', () => {
      const set2 = construct_better_set([3, 4, 5], identify_by);
      const mergedSet = merge(set, set2, identify_by);
      expect(get_length(mergedSet)).toBe(5);
      expect(to_array(mergedSet).sort()).toEqual([1, 2, 3, 4, 5]);
    });
  
    test('filter creates a new set with filtered values', () => {
      const filteredSet = filter(set, (value) => value % 2 === 0);
      expect(get_length(filteredSet)).toBe(1);
      expect(has(filteredSet, 2)).toBe(true);
    });
  
    test('map transforms set values', () => {
      const mappedArray = map(set, (value) => value * 2);
      expect(mappedArray).toEqual([2, 4, 6]);
    });
  
    test('is_subset_of checks if one set is a subset of another', () => {
      const subset = construct_better_set([1, 2], identify_by);
      const superset = construct_better_set([1, 2, 3, 4], identify_by);
      expect(is_subset_of(subset, set)).toBe(true);
      expect(is_subset_of(set, subset)).toBe(false);
      expect(is_subset_of(set, superset)).toBe(true);
    });
  
    test('get_value retrieves a value by index', () => {
      expect(get_value(set, 0)).toBe(1);
      expect(get_value(set, 1)).toBe(2);
      expect(get_value(set, 2)).toBe(3);
    });
  });