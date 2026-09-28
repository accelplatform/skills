# Identifier API 基本使用模式（Java 版）

`Identifier` 的签名・内部行为请参考 `reference/identifier-api-reference.md`。本文档展示典型的调用模式。

## 模式1: 在分布式环境中编号唯一 ID（`get()`，面向业务数据）

用于编号单据号・申请编号・记录主键等，不得与其他应用服务器生成的 ID 重复的业务数据。将 `IOException` 包装为业务异常并传播给调用方。

```java
package jp.co.example.foo.service;

import java.io.IOException;

import jp.co.intra_mart.foundation.service.client.information.Identifier;

/**
 * 提供受注编号的编号处理。
 */
public class OrderNumberGenerator {

    /**
     * 新建编号受注编号。<br>
     * 保证即使在分布式环境（多应用服务器构成）下也不会重复。
     *
     * @return 编号后的受注编号
     * @throws OrderNumberGenerationException 编号处理发生错误时
     */
    public String generate() throws OrderNumberGenerationException {
        final Identifier identifier = new Identifier();
        try {
            return identifier.get();
        } catch (final IOException e) {
            throw new OrderNumberGenerationException("受注番号の採番に失敗しました。", e);
        }
    }
}
```

- 在可以将 `IOException` 直接通过 `throws` 传播的场景（例如调用方已经处理 `IOException`）下，可以省略包装为业务异常。若项目后续新增了 Java 专用的错误处理规约，应优先遵循该规约
- `Identifier` 可以在每次调用方法时都 `new Identifier()`（因为不持有状态，实例化成本很低）

## 模式2: 在应用服务器内编号唯一 ID（`make()`，面向进程内临时标识符）

用于日志跟踪 ID、请求作用域内的关联 ID 等，只要在进程内唯一即可满足需求的标识符。由于是静态方法，无需实例化，也没有受检异常。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.service.client.information.Identifier;

/**
 * 发行用于处理跟踪的关联 ID。
 */
public class TraceIdIssuer {

    /**
     * 发行关联 ID。<br>
     * 仅保证在应用服务器内唯一，不保证分布式环境下的唯一性。
     *
     * @return 关联 ID
     */
    public String issue() {
        return Identifier.make();
    }
}
```

## 模式3: 在循环中批量编号多个 ID

由于 `get()` 每次调用都会与 Server Manager 通信，对于一次性批量编号大量 ID 的处理，可能会影响性能。件数较多时，应事先向用户说明性能方面的担忧，必要时可提出采用其他编号方式（如 DB 序列等）作为备选方案。

```java
package jp.co.example.foo.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import jp.co.intra_mart.foundation.service.client.information.Identifier;

public class BulkOrderNumberGenerator {

    public List<String> generate(final int count) throws OrderNumberGenerationException {
        final Identifier identifier = new Identifier();
        final List<String> numbers = new ArrayList<String>(count);
        try {
            for (int i = 0; i < count; i++) {
                numbers.add(identifier.get());
            }
        } catch (final IOException e) {
            throw new OrderNumberGenerationException("受注番号の一括採番に失敗しました。", e);
        }
        return numbers;
    }
}
```

## 反模式（应避免）

```java
// NG: 用作安全令牌（因为值可被预测，不适合此用途）
String resetToken = Identifier.make(); // 不要用于密码重置令牌

// NG: 吞掉 IOException
try {
    id = new Identifier().get();
} catch (IOException e) {
    // 什么都不做 ← NG。吞掉编号失败会导致后续处理产生数据不一致
}

// NG: 需求为分布式环境却使用 make()
String orderNo = Identifier.make(); // 多台服务器同时编号时可能重复
```
