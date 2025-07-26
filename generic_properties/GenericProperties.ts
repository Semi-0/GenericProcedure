import { to_string } from "../built_in_generics/generic_conversation";
import { throw_error } from "../built_in_generics/other_generic_helper";
import { construct_simple_generic_procedure, define_generic_procedure_handler } from "../GenericProcedure";
import { match_args, PredicateFunction, register_predicate } from "../Predicates";

/**
 * Properties System
 * -----------------
 * A functional property and type system that mimics the Scheme approach from "Software Design for Flexibility"
 * by Chris Hanson and Gerald Jay Sussman.
 * 
 * This system provides:
 * 1. Property definitions with predicates and default values
 * 2. Type definitions that group properties
 * 3. Type instantiation with value validation
 * 4. Property getters, setters, and modifiers
 * 5. Inheritance through type extension
 * 6. Reactive property change observation
 * 
 * The design follows functional programming principles while providing the convenience
 * of object-oriented properties. This approach balances immutability and functional
 * purity with practical property access patterns.
 */

/**
 * Configuration options for creating a property
 */
export interface PropertyOptions {
  /** Predicate function to validate property values */
  predicate?: (arg: any) => boolean;
  
  /** Default value for the property */
  default_value?: any;
  
  /** Function that supplies a default value */
  default_supplier?: () => any;
  
  /** Another property to copy the value from when this property needs a default */
  default_to_property?: Property;
}

/**
 * Property interface defining the structure of a property
 */
export interface Property {
  /** Name of the property */
  name: string;
  
  /** Predicate function to validate values of this property */
  predicate: (arg: any) => boolean;
  
  /** 
   * Function that provides a default value for this property.
   * The lookup parameter allows accessing values of other properties.
   */
  default_supplier?: (lookup: (prop: Property) => any) => any;
}

/**
 * Type predicate function that receives properties as its data
 */
export interface TypePredicate extends PredicateFunction {
  name: string;
  properties: Property[];
  supertypes: TypePredicate[];
  extends: (supertype: TypePredicate) => TypePredicate;
}

/**
 * Creates a property with a name and optional configuration
 *
 * @param name - Name of the property
 * @param options - Configuration options for the property
 * @returns A property object
 * 
 * @example
 * ```ts
 * // Simple property with name validation
 * const name_prop = make_property("name", { 
 *   predicate: (x) => typeof x === "string" 
 * });
 * 
 * // Property with a default value
 * const age_prop = make_property("age", { 
 *   predicate: (x) => typeof x === "number" && x >= 0,
 *   default_value: 0
 * });
 * 
 * // Property with a dynamic default value
 * const id_prop = make_property("id", { 
 *   predicate: (x) => typeof x === "number",
 *   default_supplier: () => Math.floor(Math.random() * 1000)
 * });
 * 
 * // Property that references another property
 * const display_name_prop = make_property("displayName", { 
 *   predicate: (x) => typeof x === "string",
 *   default_to_property: name_prop
 * });
 * ```
 */
export const make_property = (name: string, options: PropertyOptions = {}): Property => {
  const { 
    predicate = (x: any) => true, 
    default_value, 
    default_supplier, 
    default_to_property 
  } = options;
  
  // Convert default mechanisms to a supplier function, like in Scheme
  let supplier: ((lookup: (prop: Property) => any) => any) | undefined = undefined;
  
  if (default_value !== undefined) {
    supplier = (_lookup: (prop: Property) => any) => default_value;
  } else if (default_supplier !== undefined) {
    supplier = (_lookup: (prop: Property) => any) => default_supplier();
  } else if (default_to_property !== undefined) {
    supplier = (lookup: (prop: Property) => any) => lookup(default_to_property);
  }
  
  return {
    name,
    predicate,
    default_supplier: supplier
  };
};

/**
 * Type predicate that checks if an object is a property
 */
export const is_property = register_predicate("is_property", (arg: any): arg is Property =>
  arg && 
  typeof arg.name === 'string' &&
  typeof arg.predicate === 'function'
);

/**
 * Checks if a property is optional (has a default supplier)
 * 
 * @param property - The property to check
 * @returns True if the property has a default supplier, false otherwise
 */
export const property_optional = (property: Property): boolean => {
  return !!property.default_supplier;
};

/**
 * Creates a type with the given name and properties
 * 
 * @param name - Name of the type
 * @param properties - Array of properties that belong to this type
 * @returns A type predicate function
 * 
 * @example
 * ```ts
 * // Create a Person type with name and age properties
 * const person_type = make_type("Person", [name_prop, age_prop]);
 * 
 * // Create a Student type that extends Person
 * const student_type = make_type("Student", [student_id_prop]);
 * student_type.extends(person_type);
 * ```
 */
export const make_type = (name: string, properties: Property[]): TypePredicate => {
  // Create the base function
  const type_predicate_fn = function(obj: any): boolean {
    return obj && obj.__type === name;
  };
  
  // Create the TypePredicate object with writable properties
  const type_predicate = register_predicate(name, type_predicate_fn) as TypePredicate;
  
  // Add properties to the function object
  Object.defineProperties(type_predicate, {
    name: {
      value: name,
      writable: true,
      enumerable: true
    },
    properties: {
      value: properties,
      writable: true,
      enumerable: true
    },
    supertypes: {
      value: [],
      writable: true,
      enumerable: true
    },
    extends: {
      value: function(supertype: TypePredicate): TypePredicate {
        this.supertypes.push(supertype);
        return this;
      },
      writable: true,
      enumerable: true
    }
  });
  
  return type_predicate;
};

/**
 * Type predicate that checks if an object is a type
 */
export const is_type = register_predicate("is_type", (arg: any): arg is TypePredicate =>
  arg && 
  typeof arg === 'function' &&
  typeof arg.name === 'string' &&
  Array.isArray(arg.properties)
);

/**
 * Gets all properties for a type, including properties from supertypes
 * 
 * @param type - The type to get properties for
 * @returns Array of all properties, with subtype properties taking precedence
 */
const get_type_properties = (type: TypePredicate): Property[] => {
  let all_properties = [...type.properties];
  
  for (const supertype of type.supertypes) {
    all_properties = [...all_properties, ...get_type_properties(supertype)];
  }
  
  // Remove duplicates by name (subtype properties take precedence)
  const property_map = new Map<string, Property>();
  for (const prop of all_properties) {
    if (!property_map.has(prop.name)) {
      property_map.set(prop.name, prop);
    }
  }
  
  return Array.from(property_map.values());
};



/**
 * Creates an instantiator function for a given type
 * 
 * @param type - The type to create an instantiator for
 * @returns A function that creates instances of the type with provided property values
 * 
 * @example
 * ```ts
 * // Create a Person type with name and age properties
 * const person_type = make_type("Person", [name_prop, age_prop]);
 * 
 * // Create an instantiator function for Person
 * const create_person = type_instantiator(person_type);
 * 
 * // Create a person instance
 * const john = create_person({
 *   name: "John",
 *   age: 30
 * });
 * 
 * // Access properties directly
 * console.log(john.name); // "John"
 * 
 * // Update properties
 * john.age = 31;
 * ```
 */
export const type_instantiator = (type: TypePredicate) => {
  return (property_values: Record<string, any> = {}) => {
    const bindings = new Map<string, Function>();
    const observers = new Map<string, Set<Function>>();
    const properties = get_type_properties(type);
    
    // Process each property to create bindings
    for (const property of properties) {
      let value: any;
      
      // Get initial value
      if (property.name in property_values) {
        value = property_values[property.name];
        if (!property.predicate(value)) {
          // Instead of throwing directly, we'll throw a proper Error object
          const error = new Error(`Value for ${property.name} fails predicate check`);
          throw error;
        }
      } else if (property.default_supplier) {
        // Use lookup function to get defaults from other properties
        const lookup = (prop: Property) => {
          const binding = bindings.get(prop.name);
          return binding ? binding() : undefined;
        };
        
        value = property.default_supplier(lookup);
      } else {
        // Instead of using throw_error, we'll throw a proper Error object
        const error = new Error(`Missing required property: ${property.name}`);
        throw error;
      }
      
      // Create the binding function
      const binding = (new_value?: any) => {
        if (new_value === undefined) {
          return value;
        } else {
          if (!property.predicate(new_value)) {
            // Instead of using throw_error, we'll throw a proper Error object
            const error = new Error(`Value for ${property.name} fails predicate check`);
            throw error;
          }
          
          const old_value = value;
          value = new_value;
          
          // Notify observers
          const property_observers = observers.get(property.name);
          if (property_observers) {
            for (const observer of property_observers) {
              observer(instance, property, old_value, new_value);
            }
          }
          
          return value;
        }
      };
      
      bindings.set(property.name, binding);
    }
    
    // Create the instance
    const instance = {
      __type: type.name,
      
      // Method to get all property names
      __get_properties: () => Array.from(bindings.keys()),
      
      // Method to get a binding for a property
      __get_binding: (property: Property) => {
        const binding = bindings.get(property.name);
        if (!binding) {
          // Instead of using throw_error, we'll throw a proper Error object
          const error = new Error(`Unknown property: ${property.name}`);
          throw error;
        }
        return binding;
      },
      
      // Add observer for reactivity
      observe: (property: Property, callback: Function) => {
        if (!observers.has(property.name)) {
          observers.set(property.name, new Set());
        }
        observers.get(property.name)!.add(callback);
        return instance;
      },
      
      // Remove observer
      unobserve: (property: Property, callback?: Function) => {
        const property_observers = observers.get(property.name);
        if (property_observers) {
          if (callback) {
            property_observers.delete(callback);
          } else {
            // Clear all observers for this property if no callback specified
            observers.set(property.name, new Set());
          }
        }
        return instance;
      }
    };
    
    // Define property getters/setters on the instance itself
    for (const property of properties) {
      Object.defineProperty(instance, property.name, {
        get: () => bindings.get(property.name)!(),
        set: (value: any) => bindings.get(property.name)!(value),
        enumerable: true
      });
    }
    
    return instance;
  };
};

/**
 * Gets the binding function for a property on an object
 * 
 * @param property - The property to get the binding for
 * @param object - The object containing the property
 * @returns The binding function for the property
 */
export const get_binding = (property: Property, object: any) => {
  try {
    return object.__get_binding(property);
  } catch (error) {
    // If the object or binding doesn't exist, return a no-op function
    return () => undefined;
  }
};

/**
 * Gets the value of a property on an object
 * 
 * @param property - The property to get the value of
 * @param object - The object containing the property
 * @returns The value of the property
 */
export const get_property_value = (property: Property, object: any) => {
  return get_binding(property, object)();
};

/**
 * Sets the value of a property on an object
 * 
 * @param property - The property to set the value of
 * @param object - The object containing the property
 * @param value - The new value for the property
 * @returns The updated value
 */
export const set_property_value = (property: Property, object: any, value: any) => {
  try {
    return get_binding(property, object)(value);
  } catch (error) {
    // If there's an error, like a predicate failure, just re-throw it
    throw error;
  }
};

/**
 * Creates a generic procedure that gets a property value
 * 
 * @param property - The property to create a getter for
 * @param type - The type the property belongs to
 * @returns A generic procedure that gets the property value
 * 
 * @example
 * ```ts
 * // Create a getter for the name property
 * const get_name = property_getter(name_prop, person_type);
 * 
 * // Use the getter
 * const name = get_name(person);
 * ```
 */
export const property_getter = (property: Property, type: PredicateFunction) => {
  const procedure = construct_simple_generic_procedure(
    `get_${property.name}`, 
    1, 
    throw_error("ObjectCell", "property_getter", `Getter not implemented for ${property.name}`)
  );
  

  ;
  
  define_generic_procedure_handler(
    procedure, 
    match_args(type), 
    (object) => get_binding(property, object)()
  );
  
  return procedure;
};

// Debug flag - set to true to enable property change logging
const DEBUG_OUTPUT = false;

/**
 * Creates a generic procedure that sets a property value
 * 
 * @param property - The property to create a setter for
 * @param type - The type the property belongs to
 * @param value_predicate - Optional additional predicate for the value
 * @returns A generic procedure that sets the property value
 * 
 * @example
 * ```ts
 * // Create a setter for the age property
 * const set_age = property_setter(age_prop, person_type, 
 *   (x) => typeof x === "number" && x >= 0);
 * 
 * // Use the setter
 * set_age(person, 31);
 * ```
 */
export const property_setter = (property: Property, type: PredicateFunction, value_predicate: (value: any) => boolean) => {
  const procedure = construct_simple_generic_procedure(
    `set_${property.name}!`, 
    2, 
    throw_error("ObjectCell", "property_setter", `Setter not implemented for ${property.name}`)
  );
  
  
  define_generic_procedure_handler(
    procedure,
    match_args(
      type,
      value_predicate
    ),
    (object, value: any) => {
      const binding = get_binding(property, object);
      const old_value = binding();
      
      if (old_value !== value) {
        if (DEBUG_OUTPUT) {
          console.log(`Setting ${object.__type}'s ${property.name} to ${value}`);
          console.log(`Previous value was ${old_value}`);
        }
      }
      
      return binding(value);
    }
  );
  
  return procedure;
};

/**
 * Creates a generic procedure that modifies a property value
 * 
 * @param property - The property to create a modifier for
 * @param type - The type the property belongs to
 * @param value_predicate - Predicate for the modification value
 * @param noun - The name of the modification operation
 * @param modifier - Function that performs the modification
 * @returns A generic procedure that modifies the property value
 */
export const property_modifier = (property: Property, type: PredicateFunction, value_predicate: (value: any) => boolean, 
                                 noun: string, modifier: (item: any, items: any) => any) => {
  const procedure = construct_simple_generic_procedure(
    `${property.name}_${noun}`, 
    2, 
    throw_error("ObjectCell", "property_modifier", 
                       `Modifier not implemented for ${property.name}_${noun}`)
  );
  
  // Register the predicates
  define_generic_procedure_handler(
    procedure,
    match_args(
      type,
      value_predicate
    ),
    (object, item) => {
      const binding = get_binding(property, object);
      const old_value = binding();
      const new_value = modifier(item, old_value);
      
      if (old_value !== new_value) {
        if (DEBUG_OUTPUT) {
          console.log(`Modifying ${object.__type}'s ${property.name} to ${new_value}`);
          console.log(`Previous value was ${old_value}`);
        }
      }
      
      return binding(new_value);
    }
  );
  
  return procedure;
};

/**
 * Creates a generic procedure that adds a value to a collection property
 * 
 * @param property - The collection property to create an adder for
 * @param type - The type the property belongs to
 * @param value_predicate - Predicate for the item to add
 * @returns A generic procedure that adds an item to the collection
 * 
 * @example
 * ```ts
 * // Create an adder for the skills property
 * const add_skill = property_adder(skills_prop, person_type, 
 *   (x) => typeof x === "string");
 * 
 * // Use the adder
 * add_skill(person, "JavaScript");
 * ```
 */
export const property_adder = (property: Property, type: PredicateFunction, value_predicate: (value: any) => boolean) => {
  return property_modifier(property, type, value_predicate, "adder",
    (item, items) => {
      // Only add if not already present (uses eqv? in Scheme, here we use includes)
      return Array.isArray(items) && !items.includes(item) 
        ? [...items, item] 
        : items;
    }
  );
};

/**
 * Creates a generic procedure that removes a value from a collection property
 * 
 * @param property - The collection property to create a remover for
 * @param type - The type the property belongs to
 * @param value_predicate - Predicate for the item to remove
 * @returns A generic procedure that removes an item from the collection
 * 
 * @example
 * ```ts
 * // Create a remover for the skills property
 * const remove_skill = property_remover(skills_prop, person_type, 
 *   (x) => typeof x === "string");
 * 
 * // Use the remover
 * remove_skill(person, "JavaScript");
 * ```
 */
export const property_remover = (property: Property, type: PredicateFunction, value_predicate: (value: any) => boolean) => {
  return property_modifier(property, type, value_predicate, "remover",
    (item, items) => {
      // Remove the item (delv in Scheme, here we use filter)
      return Array.isArray(items)
        ? items.filter(x => x !== item)
        : items;
    }
  );
};



export interface InstantiatedType {
    __type: string
    __get_properties: () => string[]
    __get_binding: (property: Property) => any
    observe: (property: Property, callback: Function) => any
    unobserve: (property: Property, callback?: Function) => any
}

export const is_instantiated_type = register_predicate(
    "is_type_predicate",
    (x: any): x is InstantiatedType => {
        return  x.__type !== undefined && x.__get_properties !== undefined 
    }
)

export const is_default_prop = (x: string) =>
    x === "___type" ||
    x === "__get_properties" ||
    x === "__get_binding" ||
    x === "observe" ||
    x === "unobserve"


define_generic_procedure_handler(
    to_string,
    match_args(is_instantiated_type),
    (x: InstantiatedType) => {
     
        const report = "typed object:" +
        x.__type + "\n" + "property: " +  "\n" + 
        Object.keys(x).map((key: string) => {
           if (!is_default_prop(key)){
            return key + ": " + to_string(x[key as keyof InstantiatedType])
           }
           else{
            return "" 
           }
        }).join("\n")

        return report
    }
)