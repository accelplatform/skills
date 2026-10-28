# Divider

## 基本信息

Divider 是通过水平或垂直方向分隔内容来进行视觉分组的组件。
当仅通过布局和间距调整不足以区分分组时使用。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-divider--documentation
- 基础类: imds-divider

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-divider | hr 元素（水平）/ div 元素（垂直） | 分隔线 | 必须 |
| is-horizontal | imds-divider | 水平分隔线 | 可选 |
| is-vertical | imds-divider | 垂直分隔线 | 可选 |
| is-small | imds-divider | 小尺寸（间距较小） | 可选 |
| is-normal | imds-divider | 标准尺寸 | 可选 |
| is-large | imds-divider | 大尺寸（间距较大） | 可选 |

## HTML 代码片段

### 基本分隔线（水平）

```html
<div style="height: 4em; display: grid;"><hr class="imds-divider" /></div>
```

以下仅显示与基本分隔线的差异部分。

## 变体

### alignment（方向）

```html
<hr class="imds-divider is-horizontal">                                          <!-- 水平: hr 元素 -->
<div style="display: flex; height: 3rem"><div class="imds-divider is-vertical"></div></div>  <!-- 垂直: div 元素 -->
```

### size（尺寸）

```html
<hr class="imds-divider is-small">    <!-- 小 -->
<hr class="imds-divider is-normal">   <!-- 标准 -->
<hr class="imds-divider is-large">    <!-- 大 -->
```

### 导航区域内的分组（垂直分隔的使用示例）

用于对页眉等导航区域内的项目进行分组。

```html
<div class="imds-header-actions">
  <button type="button" class="imds-button is-ghost is-normal">
    <span class="imds-icon"><i class="fa-solid fa-bell"></i></span>
  </button>
  <button type="button" class="imds-button is-ghost is-normal">
    <span class="imds-icon"><i class="fa-solid fa-comment"></i></span>
  </button>
  <div class="imds-divider is-vertical"></div>
  <button type="button" class="imds-button is-ghost is-normal">
    <span class="imds-icon"><i class="fa-solid fa-question-circle"></i></span>
  </button>
</div>
```

### 菜单内分隔（水平・小尺寸）

弹出菜单等列表项之间的分隔使用 `hr.imds-divider.is-small`。

```html
<ul style="white-space: nowrap">
  <li><span>用户设置</span></li>
  <li><span>应用程序设置</span></li>
  <hr class="imds-divider is-small" />
  <li><span>退出登录</span></li>
</ul>
```

## 实现注意事项

- **水平方向（`is-horizontal` / 未指定时的默认值）使用 `hr` 元素**。`hr.imds-divider` 是实际 DOM 中的标准模式。
- **垂直方向（`is-vertical`）使用 `div` 元素**。`hr` 不具有垂直方向的语义，因此垂直分隔必须使用 `div`。
- 垂直方向时，父元素需要指定高度以及 `display: grid` 或 `display: flex`
