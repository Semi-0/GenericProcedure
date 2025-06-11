
import { construct_better_set, BetterSet} from '../built_in_generics/generic_better_set';
import { describe, beforeEach, test, expect } from 'bun:test';
import { force_load_generic_predicates } from '../built_in_generics/generic_predicates';
// ... existing tests ...
import { map, filter, reduce, add_item, remove_item, copy, has, length, for_each, reduce_right, flat_map, to_array, has_all, is_empty, find, every, remove_duplicates, first, last } from '../built_in_generics/generic_collection';
describe('array_operation', () => {
  const identify_by = (a: number) => a.toString();
  let testArray: number[];
  let testSet: BetterSet<number>;

  beforeEach(() => {
    testArray = [1, 2, 3, 4, 5];
    testSet = construct_better_set(testArray);
    force_load_generic_predicates()
  });

  test('map works with arrays and BetterSet', () => {
    const mappedArray = map(testArray, (x) => x * 2);
    expect(mappedArray).toEqual([2, 4, 6, 8, 10]);

    const mappedSet = map(testSet, (x) => x * 2);
    expect(to_array(mappedSet)).toEqual([2, 4, 6, 8, 10]);
  });

  test('filter works with arrays and BetterSet', () => {
    const filteredArray = filter(testArray, (x) => x % 2 === 0);
    expect(filteredArray).toEqual([2, 4]);

    const filteredSet = filter(testSet, (x) => x % 2 === 0);
    expect(filteredSet).toEqual(expect.any(Object)); // BetterSet
    expect(to_array(filteredSet)).toEqual([2, 4]);
  });

  test('reduce works with arrays and BetterSet', () => {
    const sumArray = reduce(testArray, (acc, val) => acc + val, 0);
    expect(sumArray).toBe(15);

    const sumSet = reduce(testSet, (acc, val) => acc + val, 0);
    expect(sumSet).toBe(15);
  });

  test('remove_duplicates works with arrays', () => {
    const arrayWithDuplicates = [1, 2, 2, 3, 4, 4, 5];
    const uniqueArray = remove_duplicates(arrayWithDuplicates);
    expect(uniqueArray).toEqual([1, 2, 3, 4, 5]);
  });

  test('first works with arrays', () => {
    const firstElement = first(testArray);
    expect(firstElement).toBe(1);
  });

  test('last works with arrays', () => {
    const lastElement = last(testArray);
    expect(lastElement).toBe(5);
  });
});