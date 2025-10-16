import { head } from "fp-ts/lib/ReadonlyNonEmptyArray";
import { guard } from "./other_generic_helper";




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
            const exec_func = functions[0];
            const arity = getArity(exec_func);  
            return spreadResult( [...results, exec_func(...inputs.slice(0, arity))], inputs.slice(arity), functions.slice(1));
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

function rightCompose<T extends any[], R>(
  ...functions: ((...args: any[]) => any)[]
): (...args: T) => R {
  return function theRightComposer(...args: T): R {
    return functions.reduceRight((x, f) => {
      return Array.isArray(x) ? f(...x) : f(x);
    }, args as any) as R;
  };
}

function andCompose<T extends any[], R>(
  ...functions: ((...args: any[]) => boolean)[]
): (...args: T) => boolean {
  return (...args: any[]) => {
    for (const func of functions){
      if (!func(...args)){
        return false
      }
    }
    return true
  }
}

function orCompose<T extends any[], R>(
  ...functions: ((...args: any[]) => boolean)[]
): (...args: T) => boolean {
  return (...args: any[]) => {
    for (const func of functions){
      if (func(...args)){
        return true
      }
    }
    return false
  }
}

function andExecute<T extends any[], R>(
  ...functions: ((...args: any[]) => any | boolean | undefined)[]
): (...args: T) => R | false {
  return (...args: any[]) => {
    var lastFunc = functions[functions.length - 1];
    for (const func of functions.slice(0, -1)){
      const result = func(...args);
      if (result === undefined){
        return false
      }
      else if (result === false){
        return false
      }
    }
    return lastFunc(...args) as R
  }
}

function orExecute<T extends any[], R>(
  ...functions: ((...args: any[]) => any | boolean | undefined)[]
): (...args: T) => R | false {
  return (...args: any[]) => {
    for (const func of functions){
      const result = func(...args);
      if (result !== undefined && result !== false){
        return result as R
      }
    }
    return false
  }
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

function discardArgument(i: number, f: (...args: any[]) => any) {
  if (!Number.isInteger(i) || i < 0) {
    throw new Error("i must be a non-negative integer");
  }


    const m = getArity(f) + 1;
    
    if (i >= m) {
      throw new Error(`Index ${i} is out of bounds for a function with ${m} arguments`);
    }

    return function theCombination(...args: any[]): any {
      if (args.length !== m) {
        throw new Error(`Expected ${m} arguments, but got ${args.length}`);
      }
      
      const newArgs = listRemove(args, i);
      return f(...newArgs as any);
    };
}

function listRemove<T>(lst: T[], index: number): T[] {
  return [...lst.slice(0, index), ...lst.slice(index + 1)];
}



function curryArgument(i: number, f: (...args: any[]) => any) {
  return function(arg: any) {

      return function(...xs: any[]): any {
        const newArgs = listInsert(xs, i, arg);
        return f(...newArgs as any);
      };
    }
}

function curryArguments(is: number[], f: (...args: any[]) => any) {
  return function(...args: any[]): any {
    return function (...xs: any[]): any { 
      const newArgs = new Array(f.length);
      
      // Place curried arguments at their specified indices
      args.forEach((arg, idx) => {
        newArgs[is[idx]] = arg;
      });
      
      // Place remaining arguments at remaining positions
      let xIndex = 0;
      for (let i = 0; i < f.length; i++) {
        if (!is.includes(i)) {
          newArgs[i] = xs[xIndex++];
        }
      }
      
      return f(...newArgs as any);
    }
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
  rightCompose,
  parallelCombine,
  spreadCombine,
  curryArgument,
  curryArguments,
  discardArgument,
  permuteArguments,
  andCompose,
  orCompose,
  andExecute,
  orExecute
}