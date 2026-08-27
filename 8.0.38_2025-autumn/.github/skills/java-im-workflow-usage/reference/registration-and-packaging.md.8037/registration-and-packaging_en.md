# Notes on Registration Method and Package Placement

## Registration to the Workflow Definition

The generated Java class is not executed by itself. It is only called once the implementation class's **fully qualified class name (FQCN)** is registered in the IM-Workflow route/flow definition (the node's plugin configuration).

The registration destination is the same `plugins[].parameter` item where the JSSP version set the `scriptPath` (the file path without the extension); the only difference is that here you set the **FQCN string**.

```xml
<!-- JSSP version (scriptPath) -->
<parameter type="string">sample/leave/workflow/action/action_process</parameter>

<!-- Java version (FQCN) -->
<parameter type="string">jp.co.intra_mart.sample.leave.workflow.action.LeaveActionProcess</parameter>
```

XML generation itself is the responsibility of `base-im-workflow-generator`. This skill only generates the Java source. The Java-side `pluginId` corresponding to the JSSP version's `pluginId` (`{exPointId}.pluginScriptExecutor`) is **`{exPointId}.pluginJavaExecutor`** (confirmed against a real XML actually registered and exported as Java class execution; confirmed for 8 processes: action process, matter start/end process, branch condition, matter delete (active/completed/archived), and matter archive process). For details and the list of unconfirmed extension points, see `.github/skills/base-im-workflow-generator/reference/java-class-registration.md`. Arrival process, union condition, and the processing target user plugin are estimated to follow the same naming rule but are unconfirmed, so verify on an actual machine before use.

## Placement on the Runtime Classpath

Java classes are loaded via the IM-Workflow engine's runtime classloader (`Thread.currentThread().getContextClassLoader()`). Therefore, the compiled `.class` (or JAR) **must exist on the application server's runtime classpath.** Simply placing the source file, as with JSSP, does not work.

The specific placement method (placing a JAR under WEB-INF/lib, placing it as an OSGi bundle module, etc.) depends on the project's build configuration, and is out of scope for this skill. Follow the existing Java module's build/deploy procedure for the project. If no existing Java module exists, confirm the following with the user:

1. Which Maven module (or new module) to add the Java source to
2. How to reflect the build artifact (JAR) into the deployment environment

## Conditions for Instantiating the Class

The registered FQCN is instantiated via something equivalent to `Class.newInstance()` (reflection). Therefore:

- **A no-argument constructor is required** (if you do not explicitly write a constructor, the implicit default constructor satisfies this. Do not make the constructor `private`, and do not make the class have only a constructor with arguments)
- The class must be `public`
- Implement it assuming that the state is cleared each time an instance is created (do not carry over state from the previous call in a field; write it statelessly)

## Approach to Package Structure

The "Package Structure" section of `.github/instructions/java-naming.instructions.md` describes a division by layer (`entity` / `service` / `repository`, etc.), but for workflow integration programs, in line with the JSSP version's convention of separating directories by feature (`{feature-name}/workflow/...`), this skill adopts a structure where **a processing-type directory is placed under a feature-specific sub-package** (see the "Placement Convention" section of `SKILL.md`). If the project has an existing package structure convention, prioritize that instead.
