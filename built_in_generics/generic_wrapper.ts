
export function generic_wrapper(
    functionToWrap: (...args: any[]) => any,
    outputModifier: (result: any) => any,
    ...inputModifiers: ((...args: any[]) => any)[]
  ) {
    return (...args: any[]) => {

      const modifiedInputs = args.map((arg, index) => {
        const modifier = inputModifiers[index];
        return modifier ? modifier(arg) : arg;
      });
  
      // Apply the wrapped function
      const result = functionToWrap(...modifiedInputs);
  
      // Apply output modifier
      return outputModifier(result);
    };
  }
  