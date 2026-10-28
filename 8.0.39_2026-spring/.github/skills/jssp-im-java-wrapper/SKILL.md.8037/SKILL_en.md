---
name: jssp-im-java-wrapper
description: Creates a new wrapper class (JSSP API) for calling your own Java processing from JSSP (the script development model). Provides the steps for a wrapper class extending `jp.co.intra_mart.system.javascript.ScriptableObject` (static function type `@JSStaticFunction` / instance type `@JSConstructor` and `@JSFunction`), registering it as a JSSP global object via `conf/products/initializer/initializer-<module ID>.xml`, and creating the d.ts type definition. Use when asked to call Java classes or methods from JSSP, expose Java processing as a JSSP API, call Java without using `Packages`, or build your own JSSP API like NewLock. Implement the Java-side business processing called from the wrapper itself with Java skills such as `java-im-architecture`. Use it only for processing that cannot be achieved with the standard JSSP APIs (d.ts) or existing skills (e.g. Excel operations with Apache POI); do not use it for processing that can be achieved with the d.ts APIs.
allowed-tools: Bash, Read, Write, Edit, Glob
---

# Java API Wrapper Creation Skill for JSSP

## Purpose

To call Java processing from a JSSP function container, implement a wrapper class on the Java side and register it as a JSSP global object (JSSP API).
The standard intra-mart JSSP APIs are implemented with the same mechanism (e.g. JSSP's `NewLock` is the registered wrapper class `NewLockObject`, which calls Java's `NewLock`).

Referencing Java classes directly from JSSP via `Packages.*` is prohibited by `.github/instructions/jssp-function-container.instructions.md`, so implement it with the method in this skill when using Java processing from JSSP.

## Criteria for Use

Create a wrapper **only for processing that cannot be achieved with the standard JSSP APIs (the SSJS APIs defined in d.ts) or existing skills**.

- In scope: using a Java library with no equivalent JSSP API, such as reading and writing Excel files with Apache POI
- Out of scope: processing for which d.ts provides an API, such as DB access, storage, HTTP communication, and sending mail (use the d.ts APIs)
- If you cannot determine whether it is in scope, confirm with the user before creating a wrapper

## Deliverables

| Deliverable | Location | Content |
|-------|-------|------|
| Wrapper class (.java) | `src/main/java/{package}/javascript/{Name}Object.java` | Extends `ScriptableObject` and exposes the methods called from JSSP |
| Registration file (.xml) | `src/main/conf/products/initializer/initializer-{last part of module ID}.xml` | Registers the wrapper class with JSSP via `<api-class>` |
| Type definition (.d.ts) | `d.ts/custom/{Name}.d.ts` | Declarations for JSSP-side type checking (`check-types.sh`) |

- For the Java-side processing (business logic) called from the wrapper, use an existing Java API or implement it separately with a Java skill (`java-im-architecture`, etc.)
- Create the JSSP screens and APIs that call the wrapper with the usual procedure, such as `jssp-page-generator`

## Conventions to Consult

| Convention | Handling |
|------|---------|
| `.github/instructions/java-code-style.instructions.md` / `.github/instructions/java-naming.instructions.md` / `.github/instructions/java-javadoc.instructions.md` | 🟢 Required — implementing the wrapper class (.java) |
| `.github/instructions/java-architecture.instructions.md` | 🟡 When newly implementing the Java-side business processing called from the wrapper |
| `.github/instructions/jssp-function-container.instructions.md` / `.github/instructions/jssp-code-style.instructions.md` | 🟡 When implementing the JSSP side that calls the wrapper |

## Complete Samples and Reference

- `assets/java-wrapper-sample.md` - Complete set of static function type and instance type wrappers, registration file, d.ts, and examples of calling from JSSP
- `reference/wrapper-reference.md` - Registration file specification, annotations, type conversion between JavaScript and Java, and exception handling

## Implementation Steps

### Step 1: Design the API to Expose

1. Decide the **JSSP-side name**
   - The string returned by the wrapper class's `getClassName()` becomes the JSSP global object name (e.g. `"SampleDummy"` → `SampleDummy.hello(...)` from JSSP)
   - Choose a name that does not collide with standard API names already defined in `d.ts/platform/` / `d.ts/tenant/`
2. Choose the **type**

   | Type | How to call from JSSP | Suitable use |
   |------|---------------------|---------------|
   | Static function type | `SampleDummy.hello('name')` | Stateless processing (same form as the standard `NewLock`) |
   | Instance type | `new SampleGreeter('prefix').greet('name')` | Processing that holds creation-time arguments or state and calls multiple methods |

3. **Separate responsibilities**: The wrapper focuses on converting arguments and calling Java processing; put business logic in Java-side classes

### Step 2: Implement the Wrapper Class

Implement it based on the code in `assets/java-wrapper-sample.md`.

- Extend `jp.co.intra_mart.system.javascript.ScriptableObject`
- Override `getClassName()` and return the JSSP-side name decided in Step 1
- Static function type: define the exposed methods as `public static` and annotate them with `@JSStaticFunction`
- Instance type:
  - Define a `public` constructor with no arguments
  - Define `public static Object constructor(Context, Object[], Function, boolean)` annotated with `@JSConstructor`, and return the created instance
  - Annotate the exposed instance methods with `@JSFunction`
- For the Java-side types and conversion methods when receiving arguments as `Object`, see "Argument Type Conversion" in `reference/wrapper-reference.md`
- No Maven dependency needs to be added to use `ScriptableObject` or the annotations (resolved by the project's parent pom)

### Step 3: Create the Registration File

Create the registration file in `src/main/conf/products/initializer/` and write the fully qualified name of the wrapper class in `<api-class>`.

- The file name is `initializer-` + **the part of the module ID after the last `.`** + `.xml` (e.g. module ID `com.example.test-imds` → `initializer-test-imds.xml`). Check the module ID in `<id>` of `module.xml`
- One file per module. If there are multiple wrapper classes, list multiple `<api-class>` elements
- For the format, see "Registration File" in `reference/wrapper-reference.md`
- Placing `system-install_*.xml` inside the jar does not register wrapper classes of the project's module

### Step 4: Create the d.ts Type Definition

Declare the JSSP-side type with `declare class` in `d.ts/custom/{Name}.d.ts` (see `assets/java-wrapper-sample.md` for an example).
`check-types.sh` loads `d.ts/**/*.d.ts`, so without the declaration the caller's type check fails with an error.

### Step 5: Build and Verify

1. Run `mvn -s settings.xml package` and confirm the build succeeds (no compile errors)
   - The registration file is validated against the XML schema at build time
2. If you created JSSP that calls the wrapper, verify it with the project's mandatory procedure (`jssp-page-verifier`, etc.)
3. After deployment, **restart the server** and then check the behavior on the JSSP screen (the registration file is loaded at server startup)

## Notes

- Calling an unregistered name from JSSP results in `ReferenceError: "{name}" is not defined.`. In that case, check the registration file's file name (last part of the module ID), location, the fully qualified name in `<api-class>`, and whether the server was restarted
- When a Java exception is thrown from the wrapper, it can be caught with `try-catch` on the JSSP side; `e.name` is `JavaException` and `e.message` is `{fully qualified exception class name}: {message}`. Displaying this message as is on a JSSP screen exposes internal information, so replace it with a generalized message on business screens
- Do not write business logic in the wrapper class. Make the wrapper the entry point to the Java-side processing, and implement the Java-side processing according to Java tests and skill conventions
