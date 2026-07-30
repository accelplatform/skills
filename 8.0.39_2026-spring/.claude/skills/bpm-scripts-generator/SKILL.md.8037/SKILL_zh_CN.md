---
name: bpm-scripts-generator
description: 基于 bpm-docs-generator 创建的规格书，生成在 IM-BPM for Accel Platform 上运行 BPM 流程所需的资源。
---

# BPMS 资源生成技能

## 目的
基于规格书生成 BPMS 化所需资源的技能集。
资源使用 intra-mart Accel Platform 的脚本开发模型（JSSP）生成。
基本上遵循 jssp-page-generator 的方针，但会针对与自建（scratch）画面的联动记述 IM-BPM 特有的要素。

## 参照 Skills

参考以下技能集生成资源。另外，面向 IM-BPM for Accel Platform 的实现条件请参见后述的「IM-BPM 资源的注意事项」

| Skills | 处理方式 |
|---------|------|
| `jssp-page-generator` + `jssp-imds-theme` | 🟢 **必读** 对应规格书的画面定义・逻辑定义 |
| `jssp-localize-support` | 有多语言化需求时必读 |
| `jssp-im-job-generator` | 规格书中有作业（Job）使用时必读 |

## 使用时机

当用户提出如下请求时：
- 「请基于 BPM 规格书创建所需的资源」
- 「请基于规格书创建脚本」
- 「请根据规格书编写程序」

**IM-BPM 资源的注意事项**
- **流程实例 ID 与任务 ID 从功能容器 init 函数的参数中获取。**
  ```
  function init(request) {
    // 来自开始事件的请求
    request.processDefinitionId;
    // 开始事件的履历参照请求
    request.historicProcessInstanceId;
    // 来自用户任务的请求
    request.taskId;
    // 设想在来自用户任务的请求时添加到请求参数中
    request.processInstanceId;
    // 任务的履历参照请求
    request.historicTaskId;
    ‥‥‥
  }
  ```

**业务数据与画面的关系**
- 基本方针
  - 从开始事件或用户任务调用业务数据登录画面进行业务数据登录时，以 insert 为基本方式。
- 在开始任务与多个用户任务中使用同一画面的流程
  - 业务数据定义中存在任务 ID 时，遵循基本方针，在开始事件・各用户任务的登录画面中对业务数据执行 insert。
    - 按开始事件・用户任务分别向业务数据追加记录。
    - 若有希望抑制业务数据记录条数等需求，也可采用在首次登录画面显示时对业务数据执行 Insert、后续用户任务对业务数据执行 Update 的方针。
  - 业务数据定义中不存在任务 ID 时，在首次登录画面显示时对业务数据执行 Insert，后续用户任务对业务数据执行 Update。
    - 首次登录时（开始事件或第一个用户任务）向业务数据追加记录，后续用户任务则对该记录更新画面输入的数据。
  - 首次登录以外的画面显示时，应获取并显示在紧前的开始事件或用户任务中输入的业务数据。
