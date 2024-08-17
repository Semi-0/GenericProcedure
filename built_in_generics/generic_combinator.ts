import { head } from "fp-ts/lib/ReadonlyNonEmptyArray";
import { guard } from "./other_generic_helper";
import { first, rest } from "./generic_array";



function getArity(func: Function): number {
  return func.length;
}

function spread<T extends any[], R>(
  f: (...args: T) => any,
  ...functions: ((...args: any[]) => any)[]
): (...args: T) => R[] {

   function ensureMatch(a: number, b: number) {
        guard(a === b, () => {
            throw new Error(`Expected arity of f to match number of arguments, f has arity ${a} and the number of arguments is ${b}`);
        });
   }

   function ensureResultIsArray(result: any) {
        guard(Array.isArray(result), () => {
            throw new Error('Result of f must be an array');
        });
   }

   function ensureAritySumMatchResult(result: any[], arities: number[]) {
        const sum = arities.reduce((a, b) => a + b, 0);
        guard(sum === result.length, () => {
            throw new Error(`Expected sum of arities ${sum} does not match result length ${result.length}`);
        });
   }

   const arities = functions.map(getArity);


   function spreadResult(results: any[], inputs: any[], functions: ((...args: any[]) => any)[]) {
        if (inputs.length === 0) {
            return results;
        }
        else{
            const exec_func = first(functions);
            const arity = getArity(exec_func);  
            return spreadResult( [...results, exec_func(...inputs.slice(0, arity))], inputs.slice(arity), rest(functions));
        }
   }



  return function theSpreader(...args: T): R[] {
    ensureMatch(getArity(f), args.length);

    const result = f(...args);

    ensureResultIsArray(result);
    ensureAritySumMatchResult(result, arities);

    // Apply each function to its corresponding slice
    return spreadResult([], result, functions) as R[];
  };
}

function compose<T extends any[], R>(
  ...functions: ((...args: any[]) => any)[]
): (...args: T) => R {
  return function theComposer(...args: T): R {
    return functions.reduce((x, f) => {
      return Array.isArray(x) ? f(...x) : f(x);
    }, args as any) as R;
  };
}


function parallelCombine<T, U, V>(
  h: (x: T, y: U) => V,
  f: (...args: any[]) => T,
  g: (...args: any[]) => U
): (...args: any[]) => V {
  return function theCombination(...args: any[]): V {
    return h(f(...args), g(...args));
  };
}

function spreadCombine<T, U, V>(
  h: (x: T, y: U) => V,
  f: (...args: any[]) => T,
  g: (...args: any[]) => U
): (...args: any[]) => V {
  const n = getArity(f);
  const m = getArity(g);
  const t = n + m;

  function theCombination(...args: any[]): V {
    if (args.length !== t) {
      throw new Error(`Expected ${t} arguments, but got ${args.length}`);
    }
    return h(f(...args.slice(0, n)), g(...args.slice(n)));
  }

  return theCombination;
}

function discardArgument(i: number) {
  if (!Number.isInteger(i) || i < 0) {
    throw new Error("i must be a non-negative integer");
  }

  return function<T extends any[], R>(f: (...args: T) => R) {
    const m = getArity(f) + 1;
    
    if (i >= m) {
      throw new Error(`Index ${i} is out of bounds for a function with ${m} arguments`);
    }

    return function theCombination(...args: any[]): R {
      if (args.length !== m) {
        throw new Error(`Expected ${m} arguments, but got ${args.length}`);
      }
      
      const newArgs = listRemove(args, i);
      return f(...newArgs as T);
    };
  };
}

function listRemove<T>(lst: T[], index: number): T[] {
  return [...lst.slice(0, index), ...lst.slice(index + 1)];
}



function curryArgument(i: number) {
  return function(...args: any[]) {
    return function<T extends any[], R>(f: (...args: T) => R) {
      if (args.length !== getArity(f) - 1) {
        throw new Error(`Expected ${getArity(f) - 1} arguments, but got ${args.length}`);
      }
      return function(x: any): R {
        const newArgs = listInsert(args, i, x);
        return f(...newArgs as T);
      };
    };
  };
}

function listInsert<T>(lst: T[], index: number, value: T): T[] {
  return [...lst.slice(0, index), value, ...lst.slice(index)];
}


function makePermutation(permspec: number[]): (args: any[]) => any[] {
  return (args: any[]) => permspec.map(i => args[i]);
}

function permuteArguments(...permspec: number[]) {
  const permute = makePermutation(permspec);

  return function<T extends any[], R>(f: (...args: T) => R) {
    const n = getArity(f);

    if (n !== permspec.length) {
      throw new Error(`Expected ${n} arguments in permspec, but got ${permspec.length}`);
    }

    return function theCombination(...args: T): R {
      if (args.length !== n) {
        throw new Error(`Expected ${n} arguments, but got ${args.length}`);
      }
      return f(...permute(args) as T);
    };
  };
}

export {
  getArity,
  spread,
  compose,
  parallelCombine,
  spreadCombine,
  discardArgument,
  permuteArguments
}