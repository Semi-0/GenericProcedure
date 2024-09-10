import { BetterSet, construct_better_set, add_item, remove_item, merge_set, difference_set } from '../built_in_generics/generic_better_set';
import { test, expect, describe, beforeEach } from "bun:test";
describe('BetterSet', () => {
    let set: BetterSet<number>;

    beforeEach(() => {
        set = construct_better_set([1, 2, 3], (a) => a.toString());
    });

    test('should add an item', () => {
        const newSet = add_item(set, 4);
        expect(newSet.has(4)).toBe(true);
        expect(newSet.has(1)).toBe(true);
    });

    test('should remove an item', () => {
        const newSet = remove_item(set, 2);
        expect(newSet.has(2)).toBe(false);
        expect(newSet.has(1)).toBe(true);
    });

    test('should merge two sets', () => {
        const set2 = construct_better_set([4, 5], (a) => a.toString());
        const mergedSet = merge_set(set, set2);
        expect(mergedSet.has(1)).toBe(true);
        expect(mergedSet.has(4)).toBe(true);
    });

    test('should find the difference between two sets', () => {
        const set2 = construct_better_set([2, 3], (a) => a.toString());
        const diffSet = difference_set(set, set2);
        expect(diffSet.has(1)).toBe(true);
        expect(diffSet.has(2)).toBe(false);
    });

    test('should filter items', () => {
        const filteredSet = set.filter(value => value > 1);
        expect(filteredSet.has(1)).toBe(false);
        expect(filteredSet.has(2)).toBe(true);
    });

    test('should map items', () => {
        const mappedSet = set.map(value => value * 2);
        expect(mappedSet.has(2)).toBe(true);
        expect(mappedSet.has(4)).toBe(true);
    });

    test('should reduce items', () => {
        const sum = set.reduce((acc, value) => acc + value, 0);
        expect(sum).toBe(6);
    });

    test('should find an item', () => {
        const found = set.find(value => value === 2);
        expect(found).toBe(2);
    });


});