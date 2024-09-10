import {
    is_string,
    is_object,
    is_array,
    is_atom,
    is_function,
    is_any,
    is_null,
    is_boolean,
    is_number,
    is_int,
    is_float
  } from '../built_in_generics/generic_predicates';
  import { test, expect, describe } from "bun:test";
  describe('Generic Predicates', () => {
    test('is_string', () => {
      expect(is_string('hello')).toBe(true);
      expect(is_string(123)).toBe(false);
      expect(is_string({})).toBe(false);
    });
  
    test('is_object', () => {
      expect(is_object({})).toBe(true);
      expect(is_object([])).toBe(true);
      expect(is_object(null)).toBe(false);
      expect(is_object('string')).toBe(false);
    });
  
    test('is_array', () => {
      expect(is_array([])).toBe(true);
      expect(is_array([1, 2, 3])).toBe(true);
      expect(is_array({})).toBe(false);
      expect(is_array('string')).toBe(false);
    });
  
    test('is_atom', () => {
      expect(is_atom('string')).toBe(true);
      expect(is_atom(123)).toBe(true);
      expect(is_atom(true)).toBe(true);
      expect(is_atom({})).toBe(true);
      expect(is_atom([])).toBe(false);
      expect(is_atom(() => {})).toBe(false);
    });
  
    test('is_function', () => {
      expect(is_function(() => {})).toBe(true);
      expect(is_function(function() {})).toBe(true);
      expect(is_function({})).toBe(false);
      expect(is_function('string')).toBe(false);
    });
  
    test('is_any', () => {
      expect(is_any('anything')).toBe(true);
      expect(is_any(123)).toBe(true);
      expect(is_any(null)).toBe(true);
      expect(is_any(undefined)).toBe(true);
    });
  
    test('is_null', () => {
      expect(is_null(null)).toBe(true);
      expect(is_null(undefined)).toBe(true);
      expect(is_null(0)).toBe(false);
      expect(is_null('')).toBe(false);
    });
  
    test('is_boolean', () => {
      expect(is_boolean(true)).toBe(true);
      expect(is_boolean(false)).toBe(true);
      expect(is_boolean(0)).toBe(false);
      expect(is_boolean('true')).toBe(false);
    });
  
    test('is_number', () => {
      expect(is_number(123)).toBe(true);
      expect(is_number(3.14)).toBe(true);
      expect(is_number(NaN)).toBe(true);
      expect(is_number('123')).toBe(false);
    });
  
    test('is_int', () => {
      expect(is_int(123)).toBe(true);
      expect(is_int(-456)).toBe(true);
      expect(is_int(3.14)).toBe(false);
      expect(is_int('123')).toBe(false);
    });
  
    test('is_float', () => {
      expect(is_float(3.14)).toBe(true);
      expect(is_float(-0.5)).toBe(true);
      expect(is_float(123)).toBe(false);
      expect(is_float('3.14')).toBe(false);
    });
  });