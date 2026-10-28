# 单选按钮与 Field 的组合（common-parts）

## 基本信息

根据单选按钮的选择，以 `disabled`/`enabled` 控制始终显示的子字段时使用的复合模式。
不存在选项（无法动态获取）时，显示 `imds-inline-message is-warning`。

- 来源: `uiux-share/common-parts/ラジオボタンとFieldの組み合わせ.md`
- 用于在设置画面、详细设置表单中通过单选选择启用子设置项的情况。

**与现有模式「单选条件分支＋展开子 FieldGroup」的区分使用**:
- 以「显示/隐藏」控制子字段时（通过 JS 切换 `display`），使用另一种模式。
- 本模式以「启用/禁用」控制子字段（HTML 的 `disabled` 属性）。字段始终可见，以非活动状态呈现。

## 构成组件

| 使用的基础组件 | 对应 reference |
|---|---|
| Radio（`imds-radio`） | [imds-html-radio.md](imds-html-radio.md) |
| Field（`imds-field`） | [imds-html-field.md](imds-html-field.md) |
| Select（`imds-select`） | [imds-html-select.md](imds-html-select.md) |
| Checkbox（`imds-checkbox`） | [imds-html-checkbox.md](imds-html-checkbox.md) |
| InlineMessage（`imds-inline-message`） | [imds-html-inline-message.md](imds-html-inline-message.md) |

## 重要注意事项（`name` 属性）

要使单选按钮实现互斥选择，必须为同一组的所有 `<input type="radio">` 附加**相同的 `name` 属性**。
没有 `name` 时，各单选按钮会被视为相互独立的选项，无法实现互斥选择。详细信息请参考 [imds-html-radio-group.md](imds-html-radio-group.md)。
本模式的 HTML 代码片段在所有示例中都附加了 `name="[REPLACE: radio-name]"`。不得省略此命名。

## HTML 代码片段

### 模式 1: 存在选项时（默认选择不使用）

子字段初始为 `disabled`，选择「使用」时通过 JS 解除 `disabled`。
子字段相对父单选按钮缩进（相当于 `padding-left: var(--space-6)`）以表示从属关系。不使用 `sample-*` 类，改用内联样式代替。

```html
<div class="imds-section">
  <h1 class="imds-heading is-bordered">[REPLACE: 区段标题]</h1>
  <p class="imds-help-text">[REPLACE: 说明文字]</p>

  <!-- 单选按钮 + 子字段容器 -->
  <div style="display: flex; flex-direction: column; gap: var(--space-3);">

    <!-- 「不使用」单选按钮 -->
    <label class="imds-radio has-text-weight-bold">
      <input type="radio" name="[REPLACE: radio-name]" value="[REPLACE: off-value]" checked />
      <span>[REPLACE: 不使用标签]</span>
    </label>

    <!-- 「使用」单选按钮 + 子字段 -->
    <div style="display: flex; flex-direction: column; gap: var(--space-2);">
      <label class="imds-radio has-text-weight-bold">
        <input type="radio" name="[REPLACE: radio-name]" value="[REPLACE: on-value]" />
        <span>[REPLACE: 使用标签]</span>
      </label>

      <!-- 子字段（缩进: var(--space-6)）初始为 disabled -->
      <div style="padding-left: var(--space-6); display: flex; flex-direction: column; gap: var(--space-2);">
        <div class="imds-field">
          <div class="imds-field-label">
            <label for="[REPLACE: select-id]">[REPLACE: 字段标签]</label>
          </div>
          <div class="imds-field-control">
            <select class="imds-select" id="[REPLACE: select-id]" disabled>
              <option value="">[REPLACE: 请选择]</option>
              <option value="[REPLACE: value1]">[REPLACE: 选项1]</option>
            </select>
          </div>
        </div>
        <div class="imds-field">
          <div class="imds-field-control">
            <label class="imds-checkbox">
              <input type="checkbox" disabled />
              <span>[REPLACE: 复选框标签]</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

> 上述第 2 个 `imds-field`（复选框用）不包含 `imds-field-label`。不需要标签的单一控件 Field 可以仅由 `imds-field-control` 构成（详细信息请参考 [imds-html-field.md](imds-html-field.md)）。

### 模式 2: 不存在选项时（将「使用」设为 disabled）

将「使用」单选按钮本身设为 `disabled`，并显示警告消息以代替子字段。

```html
<div style="display: flex; flex-direction: column; gap: var(--space-2);">
  <label class="imds-radio has-text-weight-bold">
    <input type="radio" name="[REPLACE: radio-name]" value="[REPLACE: on-value]" disabled />
    <span>[REPLACE: 使用标签]</span>
  </label>
  <div style="padding-left: var(--space-6);">
    <div class="imds-inline-message is-warning">
      <span class="imds-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
      <p>[REPLACE: “没有可选择的项目”等警告文字]</p>
    </div>
  </div>
</div>
```

## 实现注意事项

- 同一组的单选按钮必须附加相同的 `name` 属性（参见上述「重要注意事项」）。
- 子字段的缩进通过内联样式指定 `padding-left: var(--space-6)`。生成物中不包含 `sample-*` 说明用类。
- 应实现如下控制: 选择「使用」时通过 JS 解除子字段内所有 `disabled` 属性，选择「不使用」时重新附加 `disabled`。
- 无法动态获取选项且为 0 件时，禁用单选按钮并替换为 `imds-inline-message is-warning`（模式 2）。
