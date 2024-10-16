import {
    BetterSet,
    construct_better_set,
    set_add_item,
    set_remove_item,
    set_has,
    set_merge,
    set_filter,
    map_to_new_set,
    set_get_length,
    to_array,
    is_subset_of,
    get_value,
    set_flat_map,
    set_reduce_right,
    set_union,
    make_multi_dimensional_set
  } from '../built_in_generics/generic_better_set';

  import { describe, beforeEach, test, expect } from 'bun:test';
  
  describe('BetterSet', () => {
    const identify_by = (a: number) => a.toString();
    let set: BetterSet<number>;
  
    beforeEach(() => {
      set = construct_better_set([1, 2, 3], identify_by);
    });
  
    test('construct_better_set creates a set with initial values', () => {
      expect(set_get_length(set)).toBe(3);
      expect(set_has(set, 1)).toBe(true);
      expect(set_has(set, 2)).toBe(true);
      expect(set_has(set, 3)).toBe(true);
    });
  
    test('add adds a new item to the set', () => {
      const newSet = set_add_item(set, 4);
      expect(set_get_length(newSet)).toBe(4);
      expect(set_has(newSet, 4)).toBe(true);
    });
  
    test('remove removes an item from the set', () => {
      const newSet = set_remove_item(set, 2);
      expect(set_get_length(newSet)).toBe(2);
      expect(set_has(newSet, 2)).toBe(false);
    });
  
    test('merge combines two sets', () => {
      const set2 = construct_better_set([3, 4, 5], identify_by);
      const mergedSet = set_merge(set, set2, identify_by);
      expect(set_get_length(mergedSet)).toBe(5);
      expect(to_array(mergedSet).sort()).toEqual([1, 2, 3, 4, 5]);
    });
  
    test('filter creates a new set with filtered values', () => {
      const filteredSet = set_filter(set, (value) => value % 2 === 0);
      expect(set_get_length(filteredSet)).toBe(1);
      expect(set_has(filteredSet, 2)).toBe(true);
    });
  
    test('map transforms set values', () => {
      const mappedArray = map_to_new_set(set, (value) => value * 2, identify_by);
      expect(to_array(mappedArray)).toEqual([2, 4, 6]);
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
    
    test('flat_map transforms and flattens set values', () => {
      const result = set_flat_map((value) => construct_better_set([value, value * 2], identify_by), set);
      expect(set_get_length(result)).toBe(5);

      expect(to_array(result).sort()).toEqual([1, 2, 3, 4, 6]);
    });

    test('reduce_right reduces set values from right to left', () => {
      const result = set_reduce_right((acc, value) => acc - value, set, 10);
      expect(get_value(result, 0)).toBe(4); // 10 - 3 - 2 - 1 = 4
    });

    test('set_union combines two sets', () => {
   
      const unionSet = set_union(1, 2);
      expect(set_get_length(unionSet)).toBe(2);
      expect(to_array(unionSet).sort()).toEqual([1, 2]);
    });

    test('make_multi_dimensional_set creates a nested set structure', () => {
      const data = [1, [2, 3], [4, [5, 6]]];
      const multiDimSet = make_multi_dimensional_set(data);
      expect(set_get_length(multiDimSet)).toBe(3);
      
      const firstInner = get_value(multiDimSet, 1);
      expect(set_get_length(firstInner)).toBe(2);
      expect(to_array(firstInner)).toEqual([2, 3]);
      
      const secondInner = get_value(multiDimSet, 2);
      expect(set_get_length(secondInner)).toBe(2);
      // @ts-ignore
      expect(set_get_length(get_value(secondInner, 1))).toBe(2);
      // @ts-ignore
      expect(to_array(get_value(secondInner, 1))).toEqual([5, 6]);
    });
    
  });
