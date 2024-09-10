
import { array_operation } from '../built_in_generics/generic_array_operation';
import { construct_better_set, BetterSet, to_array } from '../built_in_generics/generic_better_set';
import { describe, beforeEach, test, expect } from 'bun:test';
import { force_load_generic_predicates } from '../built_in_generics/generic_predicates';
// ... existing tests ...

describe('array_operation', () => {
  const identify_by = (a: number) => a.toString();
  let testArray: number[];
  let testSet: BetterSet<number>;

  beforeEach(() => {
    testArray = [1, 2, 3, 4, 5];
    testSet = construct_better_set(testArray, identify_by);
    force_load_generic_predicates()
  });

  test('map works with arrays and BetterSet', () => {
    const mappedArray = array_operation.map(testArray, (x) => x * 2);
    expect(mappedArray).toEqual([2, 4, 6, 8, 10]);

    const mappedSet = array_operation.map(testSet, (x) => x * 2);
    expect(mappedSet).toEqual([2, 4, 6, 8, 10]);
  });

  test('filter works with arrays and BetterSet', () => {
    const filteredArray = array_operation.filter(testArray, (x) => x % 2 === 0);
    expect(filteredArray).toEqual([2, 4]);

    const filteredSet = array_operation.filter(testSet, (x) => x % 2 === 0);
    expect(filteredSet).toEqual(expect.any(Object)); // BetterSet
    expect(to_array(filteredSet)).toEqual([2, 4]);
  });

  test('reduce works with arrays and BetterSet', () => {
    const sumArray = array_operation.reduce(testArray, (acc, val) => acc + val, 0);
    expect(sumArray).toBe(15);

    const sumSet = array_operation.reduce(testSet, (acc, val) => acc + val, 0);
    expect(sumSet).toBe(15);
  });

  test('remove_duplicates works with arrays', () => {
    const arrayWithDuplicates = [1, 2, 2, 3, 4, 4, 5];
    const uniqueArray = array_operation.remove_duplicates(arrayWithDuplicates);
    expect(uniqueArray).toEqual([1, 2, 3, 4, 5]);
  });

  test('first works with arrays', () => {
    const firstElement = array_operation.first(testArray);
    expect(firstElement).toBe(1);
  });

  test('last works with arrays', () => {
    const lastElement = array_operation.last(testArray);
    expect(lastElement).toBe(5);
  });
});