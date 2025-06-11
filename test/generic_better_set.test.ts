import {
    BetterSet,
    construct_better_set,
    is_subset_of,
    get_value,
    set_union,
  } from '../built_in_generics/generic_better_set';

  import { length, has, add_item, remove_item, filter, map, reduce, reduce_right, flat_map, to_array, for_each, first, last, every, some, has_all, is_empty, find } from '../built_in_generics/generic_collection';

  import { describe, beforeEach, test, expect } from 'bun:test';
  
  describe('BetterSet', () => {
    const identify_by = (a: number) => a.toString();
    let set: BetterSet<number>;
  
    beforeEach(() => {
      set = construct_better_set([1, 2, 3]);
    });
  
    test('construct_better_set creates a set with initial values', () => {
      expect(length(set)).toBe(3);
      expect(has(set, 1)).toBe(true);
      expect(has(set, 2)).toBe(true);
      expect(has(set, 3)).toBe(true);
    });
  
    test('add adds a new item to the set', () => {
      const newSet = add_item(set, 4);
      expect(length(newSet)).toBe(4);
      expect(has(newSet, 4)).toBe(true);
    });
  
    test('remove removes an item from the set', () => {
      const newSet = remove_item(set, 2);
      expect(length(newSet)).toBe(2);
      expect(has(newSet, 2)).toBe(false);
    });
  
    test('merge combines two sets', () => {
      const set2 = construct_better_set([3, 4, 5]);
      const mergedSet = set_union(set, set2);
      expect(length(mergedSet)).toBe(5);
      expect(to_array(mergedSet).sort()).toEqual([1, 2, 3, 4, 5]);
    });
  
    test('filter creates a new set with filtered values', () => {
      const filteredSet = filter(set, (value) => value % 2 === 0);
      expect(length(filteredSet)).toBe(1);
      expect(has(filteredSet, 2)).toBe(true);
    });
  
    test('map transforms set values', () => {
      const mappedArray = map(set, (value) => value * 2);
      expect(to_array(mappedArray)).toEqual([2, 4, 6]);
    });
  
    test('is_subset_of checks if one set is a subset of another', () => {
      const subset = construct_better_set([1, 2]);
      const superset = construct_better_set([1, 2, 3, 4]);
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
      const result = flat_map(set, (value) => construct_better_set([value, value * 2]));
      expect(length(result)).toBe(5);
      // @ts-ignore
      expect(to_array(result).sort()).toEqual([1, 2, 3, 4, 6]);
    });

    test('reduce_right reduces set values from right to left', () => {
      const result = reduce_right(set, (acc, value) => acc - value, 10);
      expect(result).toBe(4); // 10 - 3 - 2 - 1 = 4
    });

    test('set_union combines two sets', () => {
   
      const unionSet = set_union(1, 2);
      expect(length(unionSet)).toBe(2);
      expect(to_array(unionSet).sort()).toEqual([1, 2]);
    });

    test('set_map only execute the function once for each value', () => {
      let count = 0
      const mappedSet = map(set, (value) => {
        count++
        return value * 2
      })
      expect(count).toBe(3)
    })


    test('make_multi_dimensional_set creates a nested set structure', () => {
      const data = [1, [2, 3], [4, [5, 6]]];
      const multiDimSet = construct_better_set(data);
      expect(length(multiDimSet)).toBe(3);
      
      const firstInner = get_value(multiDimSet, 1);
      // @ts-ignore
      expect(length(firstInner)).toBe(2);
      // @ts-ignore
      expect(to_array(firstInner)).toEqual([2, 3]);
      
      const secondInner = get_value(multiDimSet, 2);
      // @ts-ignore
      expect(length(secondInner)).toBe(2);
      // @ts-ignore
      expect(length(get_value(secondInner, 1))).toBe(2);
      // @ts-ignore
      expect(to_array(get_value(secondInner, 1))).toEqual([5, 6]);
    });
    
  });
