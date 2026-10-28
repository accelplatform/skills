# 多语言输入框（common-parts）

## 基本信息

使用 intra-mart Accel Platform 的多语言功能，以多种语言登记输入值时使用的复合模式。
在标准语言（日语）字段旁放置 globe 按钮，点击后展开/折叠追加语言字段。

- 来源: `uiux-share/common-parts/多言語の入力欄.md`
- 标准以外的语言字段动态生成（取决于平台的语言设置）。
- 需求中包含「多语言」「本地化」「语言切换」「按语言输入」时适用。
- 用于名称、说明等支持多语言的字段，以及设置画面、主数据管理画面、导入画面的表单。

## 构成组件

| 使用的基础组件 | 对应 reference |
|---|---|
| FieldGroup（`imds-field-group`） | [imds-html-field-group.md](imds-html-field-group.md) |
| Field（`imds-field`） | [imds-html-field.md](imds-html-field.md) |
| Textbox（`imds-textbox`） | [imds-html-textbox.md](imds-html-textbox.md) |
| Button（`imds-button`） | [imds-html-button.md](imds-html-button.md) |
| Divider（`imds-divider`） | [imds-html-divider.md](imds-html-divider.md) |

## HTML 代码片段

### 纵向（默认）

`imds-w-15` 是 FieldGroup 整体的宽度类，`imds-w-25` 是内部字段的宽度类（宽度类一览请参考 [imds-html-field.md](imds-html-field.md)）。

> **宽度类**: 标准字段和追加语言字段必须在所有 `imds-field` 上显式附加相同的宽度类（例: `imds-w-25`）。省略时，生成结果中各字段的输入框长度将不一致，请注意。

```html
<div class="imds-field-group imds-w-15">
  <div class="imds-field-group-label"><span>多语言</span></div>
  <div class="imds-field-group-control">
    <div class="imds-field imds-w-25">
      <div class="imds-field-label">
        <label for="[REPLACE: std-input-id]">标准</label>
      </div>
      <div class="imds-field-control">
        <input type="text" id="[REPLACE: std-input-id]" class="imds-textbox" value="" />
        <button id="[REPLACE: toggle-btn-id]" type="button" class="imds-button">
          <span class="imds-icon"><i class="fa-solid fa-globe"></i></span>
        </button>
      </div>
    </div>
    <!-- 追加语言字段（初始隐藏，通过 JS 切换）。实际的语言构成取决于平台设置并动态生成。以下为代表示例（日语、英语、中文） -->
    <hr id="[REPLACE: divider-id]" class="imds-divider" style="display: none;" />
    <div id="[REPLACE: localized-group-id]" style="display: none;">
      <div class="imds-field imds-w-25">
        <div class="imds-field-label">
          <label for="[REPLACE: lang-input-id-ja]">日语</label>
        </div>
        <div class="imds-field-control">
          <input type="text" id="[REPLACE: lang-input-id-ja]" class="imds-textbox" value="" />
        </div>
      </div>
      <div class="imds-field imds-w-25">
        <div class="imds-field-label">
          <label for="[REPLACE: lang-input-id-en]">英语</label>
        </div>
        <div class="imds-field-control">
          <input type="text" id="[REPLACE: lang-input-id-en]" class="imds-textbox" value="" />
        </div>
      </div>
      <div class="imds-field imds-w-25">
        <div class="imds-field-label">
          <label for="[REPLACE: lang-input-id-zh]">中文（中华人民共和国）</label>
        </div>
        <div class="imds-field-control">
          <input type="text" id="[REPLACE: lang-input-id-zh]" class="imds-textbox" value="" />
        </div>
      </div>
      <!-- 语言增减时，相应增减此 imds-field -->
    </div>
  </div>
</div>
```

### 水平型（`is-horizontal`）

将标签与控件横向排列时使用。

> **宽度类**: 与纵向相同，在标准字段和追加语言字段的所有 `imds-field` 上显式附加相同的 `imds-w-25`。
> **无障碍注意事项**: 此水平型模式将 `id` 附加在用于调整宽度的外层 `<div>` 上而非 `<input>` 上，因此 `<label for="...">` 与 `<input>` 的关联会断开。必须在各 `<input>` 上附加 `aria-label="[语言名]"`（与标签相同的文字）（省略时会违反 lint 的 `input-no-label`）。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>多语言</span></div>
  <div class="imds-field-group-control">
    <div class="imds-field imds-w-25">
      <div class="imds-field-label">
        <label for="[REPLACE: std-input-id]">标准</label>
      </div>
      <div class="imds-field-control">
        <input type="text" id="[REPLACE: std-input-id]" class="imds-textbox" value="" />
        <button id="[REPLACE: toggle-btn-id]" type="button" class="imds-button">
          <span class="imds-icon"><i class="fa-solid fa-globe"></i></span>
        </button>
      </div>
    </div>
    <!-- 实际的语言构成取决于平台设置并动态生成。以下为代表示例（日语、英语、中文） -->
    <hr id="[REPLACE: divider-id]" class="imds-divider" style="display: none;" />
    <div id="[REPLACE: localized-group-id]" class="imds-field-group" style="display: none;">
      <div class="imds-field-group-control">
        <div class="imds-field imds-w-25">
          <div class="imds-field-label">
            <label for="[REPLACE: lang-input-id-ja]">日语</label>
          </div>
          <div class="imds-field-control">
            <div id="[REPLACE: lang-input-id-ja]" style="width: 100%; padding-right: calc(1em + 3.2rem);">
              <input type="text" class="imds-textbox" value="" aria-label="日语">
            </div>
          </div>
        </div>
        <div class="imds-field imds-w-25">
          <div class="imds-field-label">
            <label for="[REPLACE: lang-input-id-en]">英语</label>
          </div>
          <div class="imds-field-control">
            <div id="[REPLACE: lang-input-id-en]" style="width: 100%; padding-right: calc(1em + 3.2rem);">
              <input type="text" class="imds-textbox" value="" aria-label="英语">
            </div>
          </div>
        </div>
        <div class="imds-field imds-w-25">
          <div class="imds-field-label">
            <label for="[REPLACE: lang-input-id-zh]">中文（中华人民共和国）</label>
          </div>
          <div class="imds-field-control">
            <div id="[REPLACE: lang-input-id-zh]" style="width: 100%; padding-right: calc(1em + 3.2rem);">
              <input type="text" class="imds-textbox" value="" aria-label="中文（中华人民共和国）">
            </div>
          </div>
        </div>
        <!-- 语言增减时，相应增减此 imds-field -->
      </div>
    </div>
  </div>
</div>
```

## JS 控制

点击 globe 按钮时切换 divider 和追加语言组的显示/隐藏。
将 `[REPLACE: toggle-btn-id]` / `[REPLACE: divider-id]` / `[REPLACE: localized-group-id]` 替换为实际的 id。

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('[REPLACE: toggle-btn-id]');
  const divider = document.getElementById('[REPLACE: divider-id]');
  const localizedGroup = document.getElementById('[REPLACE: localized-group-id]');

  toggleButton.addEventListener('click', () => {
    const isHidden = divider.style.display === 'none';
    divider.style.display = isHidden ? '' : 'none';
    localizedGroup.style.display = isHidden ? '' : 'none';
  });
});
```

## 实现注意事项

- 标准字段和追加语言字段必须显式附加相同的宽度类（例: `imds-w-25`）。
- 水平型中不在 `<input>` 上附加 `id`，而是附加在外层 `div` 上，因此与 `label` 的关联会丢失。必须在各 `<input>` 上附加 `aria-label`。
- 追加语言字段的数量取决于平台的语言设置并动态增减。日语、英语、中文仅为代表示例，实现时应采用动态生成。
