#!/usr/bin/env node
/**
 * imds 構造検証スクリプト（コンポーネント別エラー番号版）
 *
 * imds コンポーネントの HTML 構造規約を、スタックベースの簡易パーサーで検証する。
 * 正規表現では検出できない親子関係や、必須クラスの欠落を機械的に検出することが目的。
 *
 * エラー番号体系:
 *   IMDS-<COMPONENT>-NNN（例: IMDS-BUTTON-001 / IMDS-FIELD-100 / IMDS-DIALOG-202）
 *   - 001-099 : tag-element 系（クラスが正しい要素に付与されているか）
 *   - 100-199 : parent 系（親子関係）
 *   - 200-299 : required-descendant 系（必須子孫クラスの存在）
 *
 * 検証対象:
 *   1. tag-element        … クラス X は要素 Y に付与しなければならない
 *                          （例: imds-button は <button> に付与）
 *   2. parent             … クラス X の親（direct / ancestor）は Y でなければならない
 *                          （例: imds-field-label の直接の親は imds-field）
 *   3. required-descendant … クラス X を持つ要素は、特定の子孫クラス Y を持たねばならない
 *                          （例: imds-field は imds-field-label と imds-field-control を持つ）
 *   4. unknown            … reference/rules に記載のない imds-* クラスを検出（warning）
 *
 * 使い方:
 *   node validate-imds.js <ディレクトリまたはファイル>
 *   node validate-imds.js src/main/jssp/src/sample/
 *
 * 他スクリプトからの利用:
 *   const { IMDS_RULES, validateImds } = require('./validate-imds.js');
 *
 * 旧版:
 *   validate-imds.old.js（コンポーネント別 ID への移行前のバージョン）
 *
 * 終了コード: 0=OK, 1=エラーあり
 */
'use strict';

const fs = require('fs');
const path = require('path');

// ========================================
// ルール定義（コンポーネント別）
// ========================================
//
// 各ルールの共通フィールド:
//   id           {string}              ルールID（IMDS-<COMPONENT>-NNN）
//   component    {string}              コンポーネント名（表示用）
//   type         {'tag-element'|'parent'|'required-descendant'}
//   severity     {'error'|'warning'}
//   message      {string}
//
// type: 'tag-element' のフィールド:
//   triggerClass         {string}       対象クラス
//   requiredTag          {string}       そのクラスを付与すべき要素タグ
//   skipIfFileContains   {string|null}  ファイル全体に指定文字列が含まれる場合はチェックしない
//                                       （例: <imart type="workflowOpenPage"> 内では <form> が
//                                       ネストして HTML5 パーサに除去されるため、imds-form を
//                                       <div> に付与する運用が必要）
//
// type: 'parent' のフィールド:
//   triggerTag   {string|null}  対象タグ（null=任意）
//   triggerClass {string|null}  対象クラス（null=任意）
//   depth        {'direct'|'ancestor'}
//   parentTag    {string|null}  必要な親タグ
//   parentClass  {string|null}  必要な親クラス
//   contextClass {string|null}  指定クラスが祖先に存在する場合のみ適用（限定ルール）
//
// type: 'required-descendant' のフィールド:
//   triggerClass    {string}  対象（コンポーネントルート）クラス
//   triggerTag      {string|null}  対象タグ（null=任意。例: imds-dialog-wrapper は dialog/div どちらも可）
//   requiredClass   {string}  内部に必須の子孫クラス
//   skipIfContext   {string|null}  指定クラスが祖先にある場合はチェックしない（ネスト用途）
//
// 番号付与の方針:
//   001-099 : tag-element 系
//   100-199 : parent 系
//   200-299 : required-descendant 系
//
const IMDS_RULES = [

  // ===========================================================
  // Button (imds-button)
  // ===========================================================
  {
    id: 'IMDS-BUTTON-001', component: 'Button', type: 'tag-element',
    triggerClass: 'imds-button', requiredTag: 'button',
    severity: 'error',
    message: 'imds-button クラスは button 要素に付与してください（a/div への付与は不可）'
  },
  {
    id: 'IMDS-BUTTON-002', component: 'Button', type: 'tag-element',
    triggerClass: 'imds-button-text', requiredTag: 'span',
    severity: 'error',
    message: 'imds-button-text クラスは span 要素に付与してください'
  },
  {
    id: 'IMDS-BUTTON-100', component: 'Button', type: 'parent',
    triggerTag: 'span', triggerClass: 'imds-button-text',
    depth: 'direct', parentTag: 'button', parentClass: 'imds-button',
    severity: 'error',
    message: 'span.imds-button-text の直接の親は button.imds-button でなければなりません'
  },

  // ===========================================================
  // Field (imds-field)
  // ===========================================================
  {
    id: 'IMDS-FIELD-100', component: 'Field', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-field-label',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-field',
    severity: 'error',
    message: 'div.imds-field-label の直接の親は div.imds-field でなければなりません'
  },
  {
    id: 'IMDS-FIELD-101', component: 'Field', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-field-control',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-field',
    severity: 'error',
    message: 'div.imds-field-control の直接の親は div.imds-field でなければなりません'
  },
  {
    id: 'IMDS-FIELD-102', component: 'Field', type: 'parent',
    triggerTag: 'span', triggerClass: 'imds-help-text',
    depth: 'ancestor', parentTag: null, parentClass: 'imds-field',
    // imds-field-group も親として許可するため checkParent 側で OR 評価
    severity: 'error',
    message: 'span.imds-help-text は imds-field または imds-field-group の子孫でなければなりません'
  },
  {
    id: 'IMDS-FIELD-103', component: 'Field', type: 'parent',
    triggerTag: 'span', triggerClass: 'imds-error-text',
    depth: 'ancestor', parentTag: null, parentClass: 'imds-field',
    severity: 'error',
    message: 'span.imds-error-text は imds-field または imds-field-group の子孫でなければなりません'
  },
  {
    id: 'IMDS-FIELD-200', component: 'Field', type: 'required-descendant',
    triggerClass: 'imds-field', triggerTag: 'div',
    requiredClass: 'imds-field-label',
    // imds-field-group-control 内の imds-field は imds-field-label を省略してよい
    // （field-group リファレンス「ラベルなしで統一する場合」）
    skipIfContext: 'imds-field-group-control',
    severity: 'error',
    message: 'div.imds-field 内に必須の imds-field-label がありません（正しい構造: div.imds-field > div.imds-field-label + div.imds-field-control）'
  },
  {
    id: 'IMDS-FIELD-201', component: 'Field', type: 'required-descendant',
    triggerClass: 'imds-field', triggerTag: 'div',
    requiredClass: 'imds-field-control',
    severity: 'error',
    message: 'div.imds-field 内に必須の imds-field-control がありません（正しい構造: div.imds-field > div.imds-field-label + div.imds-field-control）'
  },

  // ===========================================================
  // FieldGroup (imds-field-group)
  // ===========================================================
  {
    id: 'IMDS-FIELD-GROUP-100', component: 'FieldGroup', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-field-group-label',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-field-group',
    severity: 'error',
    message: 'div.imds-field-group-label の直接の親は div.imds-field-group でなければなりません'
  },
  {
    id: 'IMDS-FIELD-GROUP-101', component: 'FieldGroup', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-field-group-control',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-field-group',
    severity: 'error',
    message: 'div.imds-field-group-control の直接の親は div.imds-field-group でなければなりません'
  },
  {
    id: 'IMDS-FIELD-GROUP-102', component: 'FieldGroup', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-field',
    contextClass: 'imds-field-group-control',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-field-group-control',
    severity: 'error',
    message: 'imds-field-group-control 内の div.imds-field の直接の親は imds-field-group-control でなければなりません'
  },
  {
    id: 'IMDS-FIELD-GROUP-200', component: 'FieldGroup', type: 'required-descendant',
    triggerClass: 'imds-field-group', triggerTag: 'div',
    requiredClass: 'imds-field-group-label',
    // imds-field-group-control 内の imds-field-group は imds-field-group-label を省略してよい
    // （複数列レイアウト用の入れ子。imds-form-page リファレンス参照）
    skipIfContext: 'imds-field-group-control',
    severity: 'error',
    message: 'div.imds-field-group 内に必須の imds-field-group-label がありません'
  },
  {
    id: 'IMDS-FIELD-GROUP-201', component: 'FieldGroup', type: 'required-descendant',
    triggerClass: 'imds-field-group', triggerTag: 'div',
    requiredClass: 'imds-field-group-control',
    severity: 'error',
    message: 'div.imds-field-group 内に必須の imds-field-group-control がありません'
  },

  // ===========================================================
  // Checkbox / CheckboxGroup
  // ===========================================================
  {
    id: 'IMDS-CHECKBOX-001', component: 'Checkbox', type: 'tag-element',
    triggerClass: 'imds-checkbox', requiredTag: 'label',
    severity: 'error',
    message: 'imds-checkbox クラスは label 要素に付与してください（正しい構造: label.imds-checkbox > input[type="checkbox"] + span）'
  },
  {
    id: 'IMDS-CHECKBOX-GROUP-001', component: 'CheckboxGroup', type: 'tag-element',
    triggerClass: 'imds-checkbox-group', requiredTag: 'div',
    severity: 'error',
    message: 'imds-checkbox-group クラスは div 要素に付与してください'
  },
  {
    id: 'IMDS-CHECKBOX-GROUP-100', component: 'CheckboxGroup', type: 'parent',
    triggerTag: 'label', triggerClass: 'imds-checkbox',
    contextClass: 'imds-checkbox-group',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-checkbox-group',
    severity: 'error',
    message: 'imds-checkbox-group 内の label.imds-checkbox の直接の親は imds-checkbox-group でなければなりません'
  },

  // ===========================================================
  // Radio / RadioGroup
  // ===========================================================
  {
    id: 'IMDS-RADIO-001', component: 'Radio', type: 'tag-element',
    triggerClass: 'imds-radio', requiredTag: 'label',
    severity: 'error',
    message: 'imds-radio クラスは label 要素に付与してください（正しい構造: label.imds-radio > input[type="radio"] + span）'
  },
  {
    id: 'IMDS-RADIO-GROUP-001', component: 'RadioGroup', type: 'tag-element',
    triggerClass: 'imds-radio-group', requiredTag: 'div',
    severity: 'error',
    message: 'imds-radio-group クラスは div 要素に付与してください'
  },
  {
    id: 'IMDS-RADIO-GROUP-100', component: 'RadioGroup', type: 'parent',
    triggerTag: 'label', triggerClass: 'imds-radio',
    contextClass: 'imds-radio-group',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-radio-group',
    severity: 'error',
    message: 'imds-radio-group 内の label.imds-radio の直接の親は imds-radio-group でなければなりません'
  },

  // ===========================================================
  // Textbox / TextboxControl / Textarea / Select
  // ===========================================================
  {
    id: 'IMDS-TEXTBOX-001', component: 'Textbox', type: 'tag-element',
    triggerClass: 'imds-textbox', requiredTag: 'input',
    severity: 'error',
    message: 'imds-textbox クラスは input 要素に付与してください'
  },
  {
    id: 'IMDS-TEXTBOX-CONTROL-100', component: 'TextboxControl', type: 'parent',
    triggerTag: 'input', triggerClass: 'imds-textbox',
    contextClass: 'imds-textbox-control',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-textbox-control',
    severity: 'error',
    message: 'imds-textbox-control 内の input.imds-textbox の直接の親は imds-textbox-control でなければなりません'
  },
  {
    id: 'IMDS-TEXTAREA-001', component: 'Textarea', type: 'tag-element',
    triggerClass: 'imds-textarea', requiredTag: 'textarea',
    severity: 'error',
    message: 'imds-textarea クラスは textarea 要素に付与してください（imds-textbox と混同しないこと）'
  },
  {
    id: 'IMDS-SELECT-001', component: 'Select', type: 'tag-element',
    triggerClass: 'imds-select', requiredTag: 'select',
    severity: 'error',
    message: 'imds-select クラスは select 要素に付与してください'
  },

  // ===========================================================
  // Toggle (imds-toggle-switch)
  // ===========================================================
  {
    id: 'IMDS-TOGGLE-001', component: 'Toggle', type: 'tag-element',
    triggerClass: 'imds-toggle-switch', requiredTag: 'label',
    severity: 'error',
    message: 'imds-toggle-switch クラスは label 要素に付与してください'
  },
  {
    id: 'IMDS-TOGGLE-002', component: 'Toggle', type: 'tag-element',
    triggerClass: 'imds-toggle-switch-appearance', requiredTag: 'span',
    severity: 'error',
    message: 'imds-toggle-switch-appearance クラスは span 要素に付与してください'
  },
  {
    id: 'IMDS-TOGGLE-003', component: 'Toggle', type: 'tag-element',
    triggerClass: 'imds-toggle-switch-text', requiredTag: 'span',
    severity: 'error',
    message: 'imds-toggle-switch-text クラスは span 要素に付与してください'
  },
  {
    id: 'IMDS-TOGGLE-200', component: 'Toggle', type: 'required-descendant',
    triggerClass: 'imds-toggle-switch', triggerTag: 'label',
    requiredClass: 'imds-toggle-switch-appearance',
    severity: 'error',
    message: 'label.imds-toggle-switch 内に必須の imds-toggle-switch-appearance がありません'
  },
  {
    id: 'IMDS-TOGGLE-201', component: 'Toggle', type: 'required-descendant',
    triggerClass: 'imds-toggle-switch', triggerTag: 'label',
    requiredClass: 'imds-toggle-switch-text',
    severity: 'error',
    message: 'label.imds-toggle-switch 内に必須の imds-toggle-switch-text がありません'
  },

  // ===========================================================
  // Table (imds-table)
  // ===========================================================
  {
    id: 'IMDS-TABLE-100', component: 'Table', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-table-inner',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-table',
    severity: 'error',
    message: 'div.imds-table-inner の直接の親は div.imds-table でなければなりません（正しい構造: div.imds-table > div.imds-table-inner > table）'
  },
  {
    id: 'IMDS-TABLE-101', component: 'Table', type: 'parent',
    triggerTag: 'table', triggerClass: null,
    contextClass: 'imds-table',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-table-inner',
    severity: 'error',
    message: 'div.imds-table 内の <table> の直接の親は div.imds-table-inner でなければなりません'
  },
  {
    id: 'IMDS-TABLE-200', component: 'Table', type: 'required-descendant',
    triggerClass: 'imds-table', triggerTag: 'div',
    requiredClass: 'imds-table-inner',
    severity: 'error',
    message: 'div.imds-table 内に必須の imds-table-inner がありません'
  },

  // ===========================================================
  // Dialog (imds-dialog-wrapper / imds-dialog / ...)
  // ===========================================================
  {
    id: 'IMDS-DIALOG-100', component: 'Dialog', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-dialog',
    depth: 'direct', parentTag: null, parentClass: 'imds-dialog-wrapper',
    severity: 'error',
    message: 'div.imds-dialog の直接の親は .imds-dialog-wrapper を持つ要素（<div> または <dialog>）でなければなりません'
  },
  {
    id: 'IMDS-DIALOG-101', component: 'Dialog', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-dialog-header',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-dialog',
    severity: 'error',
    message: 'div.imds-dialog-header の直接の親は div.imds-dialog でなければなりません'
  },
  {
    id: 'IMDS-DIALOG-102', component: 'Dialog', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-dialog-content',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-dialog',
    severity: 'error',
    message: 'div.imds-dialog-content の直接の親は div.imds-dialog でなければなりません'
  },
  {
    id: 'IMDS-DIALOG-103', component: 'Dialog', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-dialog-title-wrapper',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-dialog-header',
    severity: 'error',
    message: 'div.imds-dialog-title-wrapper の直接の親は div.imds-dialog-header でなければなりません'
  },
  {
    id: 'IMDS-DIALOG-104', component: 'Dialog', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-dialog-title',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-dialog-title-wrapper',
    severity: 'error',
    message: 'div.imds-dialog-title の直接の親は div.imds-dialog-title-wrapper でなければなりません'
  },
  {
    id: 'IMDS-DIALOG-105', component: 'Dialog', type: 'parent',
    triggerTag: 'button', triggerClass: 'imds-dialog-header-close',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-dialog-header',
    severity: 'error',
    message: 'button.imds-dialog-header-close の直接の親は div.imds-dialog-header でなければなりません'
  },
  {
    id: 'IMDS-DIALOG-106', component: 'Dialog', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-dialog-footer',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-dialog',
    severity: 'error',
    message: 'div.imds-dialog-footer の直接の親は div.imds-dialog でなければなりません（dialog + form パターンのアクションボタン領域）'
  },
  {
    id: 'IMDS-DIALOG-200', component: 'Dialog', type: 'required-descendant',
    triggerClass: 'imds-dialog-wrapper', triggerTag: null,
    requiredClass: 'imds-dialog',
    severity: 'error',
    message: '.imds-dialog-wrapper 内に必須の imds-dialog がありません'
  },
  {
    id: 'IMDS-DIALOG-201', component: 'Dialog', type: 'required-descendant',
    triggerClass: 'imds-dialog', triggerTag: 'div',
    requiredClass: 'imds-dialog-header',
    severity: 'error',
    message: 'div.imds-dialog 内に必須の imds-dialog-header がありません'
  },
  {
    id: 'IMDS-DIALOG-202', component: 'Dialog', type: 'required-descendant',
    triggerClass: 'imds-dialog', triggerTag: 'div',
    requiredClass: 'imds-dialog-content',
    severity: 'error',
    message: 'div.imds-dialog 内に必須の imds-dialog-content がありません'
  },
  {
    id: 'IMDS-DIALOG-203', component: 'Dialog', type: 'required-descendant',
    triggerClass: 'imds-dialog-header', triggerTag: 'div',
    requiredClass: 'imds-dialog-title-wrapper',
    severity: 'error',
    message: 'div.imds-dialog-header 内に必須の imds-dialog-title-wrapper がありません'
  },
  {
    id: 'IMDS-DIALOG-204', component: 'Dialog', type: 'required-descendant',
    triggerClass: 'imds-dialog-title-wrapper', triggerTag: 'div',
    requiredClass: 'imds-dialog-title',
    severity: 'error',
    message: 'div.imds-dialog-title-wrapper 内に必須の imds-dialog-title がありません'
  },

  // ===========================================================
  // Container (imds-container)
  // ===========================================================
  // imds テーマでは、<div class="imds-container"> の直下に
  // <header class="imds-header"> + <main> を配置するのが標準構成。
  // imds-header が無いと、imds テーマのヘッダ CSS が当たらず画面が崩れる。
  // （リファレンス: imds-html-header.md「<header class="imds-header"> は
  //   <main> の外側、imds-container の直下に置く」）
  //
  // IMDS-CONTAINER-100: <main> は imds-container の子孫でなければならない。
  // imds-* クラスが一切ない HTML でも、<main> の存在を手がかりにページ構造の
  // 不備を検出できるようにするためのルール。
  // imds-container を使わずに <main> を直書きするパターンは不準拠であるため
  // エラーとする。フラグメント（<main> を含まない部分テンプレート）は対象外。
  {
    id: 'IMDS-CONTAINER-100', component: 'Container', type: 'parent',
    triggerTag: 'main', triggerClass: null,
    depth: 'ancestor', parentTag: null, parentClass: 'imds-container',
    severity: 'error',
    message: '<main> 要素は div.imds-container の子孫でなければなりません（正しい構造: div.imds-container > header.imds-header + main）'
  },
  {
    id: 'IMDS-CONTAINER-200', component: 'Container', type: 'required-descendant',
    triggerClass: 'imds-container', triggerTag: 'div',
    requiredClass: 'imds-header',
    severity: 'error',
    message: 'div.imds-container 内に必須の header.imds-header がありません（imds-container の直下に <header class="imds-header"> を配置してください）'
  },

  // ===========================================================
  // Header (imds-header)
  // ===========================================================
  {
    id: 'IMDS-HEADER-100', component: 'Header', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-header-back-button',
    depth: 'direct', parentTag: 'header', parentClass: 'imds-header',
    severity: 'error',
    message: 'div.imds-header-back-button の直接の親は header.imds-header でなければなりません'
  },
  {
    id: 'IMDS-HEADER-101', component: 'Header', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-header-icon',
    depth: 'direct', parentTag: 'header', parentClass: 'imds-header',
    severity: 'error',
    message: 'div.imds-header-icon の直接の親は header.imds-header でなければなりません'
  },
  {
    id: 'IMDS-HEADER-102', component: 'Header', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-header-title',
    depth: 'direct', parentTag: 'header', parentClass: 'imds-header',
    severity: 'error',
    message: 'div.imds-header-title の直接の親は header.imds-header でなければなりません'
  },
  {
    id: 'IMDS-HEADER-103', component: 'Header', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-header-reload-button',
    depth: 'direct', parentTag: 'header', parentClass: 'imds-header',
    severity: 'error',
    message: 'div.imds-header-reload-button の直接の親は header.imds-header でなければなりません'
  },
  {
    id: 'IMDS-HEADER-104', component: 'Header', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-header-additional',
    depth: 'direct', parentTag: 'header', parentClass: 'imds-header',
    severity: 'error',
    message: 'div.imds-header-additional の直接の親は header.imds-header でなければなりません'
  },
  {
    id: 'IMDS-HEADER-105', component: 'Header', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-header-actions',
    depth: 'direct', parentTag: 'header', parentClass: 'imds-header',
    severity: 'error',
    message: 'div.imds-header-actions の直接の親は header.imds-header でなければなりません'
  },
  {
    id: 'IMDS-HEADER-106', component: 'Header', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-header-nav',
    depth: 'direct', parentTag: 'header', parentClass: 'imds-header',
    severity: 'error',
    message: 'div.imds-header-nav の直接の親は header.imds-header でなければなりません'
  },
  {
    id: 'IMDS-HEADER-107', component: 'Header', type: 'parent',
    triggerTag: 'span', triggerClass: 'imds-icon-wrapper',
    contextClass: 'imds-header-icon',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-header-icon',
    severity: 'error',
    message: 'imds-header-icon 内の span.imds-icon-wrapper の直接の親は imds-header-icon でなければなりません'
  },
  {
    id: 'IMDS-HEADER-200', component: 'Header', type: 'required-descendant',
    triggerClass: 'imds-header', triggerTag: 'header',
    requiredClass: 'imds-header-title',
    severity: 'error',
    message: 'header.imds-header 内に必須の imds-header-title がありません（タイトル領域は必須）'
  },

  // ===========================================================
  // Tabs (imds-tabs)
  // ===========================================================
  {
    id: 'IMDS-TABS-001', component: 'Tabs', type: 'tag-element',
    triggerClass: 'imds-tabs', requiredTag: 'div',
    severity: 'error',
    message: 'imds-tabs クラスは div 要素に付与してください'
  },
  {
    id: 'IMDS-TABS-002', component: 'Tabs', type: 'tag-element',
    triggerClass: 'imds-tabs-tab', requiredTag: 'li',
    severity: 'error',
    message: 'imds-tabs-tab クラスは li 要素に付与してください'
  },
  {
    id: 'IMDS-TABS-100', component: 'Tabs', type: 'parent',
    triggerTag: 'li', triggerClass: 'imds-tabs-tab',
    depth: 'ancestor', parentTag: 'div', parentClass: 'imds-tabs',
    severity: 'error',
    message: 'li.imds-tabs-tab は div.imds-tabs の子孫でなければなりません（正しい構造: div.imds-tabs > ul > li.imds-tabs-tab）'
  },
  {
    id: 'IMDS-TABS-101', component: 'Tabs', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-tabs-actions',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-tabs',
    severity: 'error',
    message: 'div.imds-tabs-actions の直接の親は div.imds-tabs でなければなりません'
  },
  {
    id: 'IMDS-TABS-200', component: 'Tabs', type: 'required-descendant',
    triggerClass: 'imds-tabs', triggerTag: 'div',
    requiredClass: 'imds-tabs-tab',
    severity: 'error',
    message: 'div.imds-tabs 内に必須の imds-tabs-tab がありません'
  },

  // ===========================================================
  // Pagination (imds-pagination)
  // ===========================================================
  {
    id: 'IMDS-PAGINATION-001', component: 'Pagination', type: 'tag-element',
    triggerClass: 'imds-pagination', requiredTag: 'nav',
    severity: 'error',
    message: 'imds-pagination クラスは nav 要素に付与してください'
  },
  {
    id: 'IMDS-PAGINATION-100', component: 'Pagination', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-pagination-controls',
    depth: 'direct', parentTag: 'nav', parentClass: 'imds-pagination',
    severity: 'error',
    message: 'div.imds-pagination-controls の直接の親は nav.imds-pagination でなければなりません'
  },
  {
    id: 'IMDS-PAGINATION-101', component: 'Pagination', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-pagination-page-number',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-pagination-controls',
    severity: 'error',
    message: 'div.imds-pagination-page-number の直接の親は div.imds-pagination-controls でなければなりません'
  },
  {
    id: 'IMDS-PAGINATION-102', component: 'Pagination', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-pagination-options',
    depth: 'direct', parentTag: 'nav', parentClass: 'imds-pagination',
    severity: 'error',
    message: 'div.imds-pagination-options の直接の親は nav.imds-pagination でなければなりません'
  },
  {
    id: 'IMDS-PAGINATION-103', component: 'Pagination', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-pagination-records-per-page',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-pagination-options',
    severity: 'error',
    message: 'div.imds-pagination-records-per-page の直接の親は div.imds-pagination-options でなければなりません'
  },
  {
    id: 'IMDS-PAGINATION-200', component: 'Pagination', type: 'required-descendant',
    triggerClass: 'imds-pagination', triggerTag: 'nav',
    requiredClass: 'imds-pagination-controls',
    severity: 'error',
    message: 'nav.imds-pagination 内に必須の imds-pagination-controls がありません'
  },
  {
    id: 'IMDS-PAGINATION-201', component: 'Pagination', type: 'required-descendant',
    triggerClass: 'imds-pagination-controls', triggerTag: 'div',
    requiredClass: 'imds-pagination-page-number',
    severity: 'error',
    message: 'div.imds-pagination-controls 内に必須の imds-pagination-page-number がありません'
  },

  // ===========================================================
  // Accordion (imds-accordion)
  // ===========================================================
  {
    id: 'IMDS-ACCORDION-001', component: 'Accordion', type: 'tag-element',
    triggerClass: 'imds-accordion-title', requiredTag: 'label',
    severity: 'error',
    message: 'imds-accordion-title クラスは label 要素に付与してください'
  },
  {
    id: 'IMDS-ACCORDION-100', component: 'Accordion', type: 'parent',
    triggerTag: 'label', triggerClass: 'imds-accordion-title',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-accordion',
    severity: 'error',
    message: 'label.imds-accordion-title の直接の親は div.imds-accordion でなければなりません'
  },
  {
    id: 'IMDS-ACCORDION-101', component: 'Accordion', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-accordion-content',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-accordion',
    severity: 'error',
    message: 'div.imds-accordion-content の直接の親は div.imds-accordion でなければなりません'
  },
  {
    id: 'IMDS-ACCORDION-102', component: 'Accordion', type: 'parent',
    triggerTag: 'span', triggerClass: 'imds-accordion-title-inner',
    depth: 'direct', parentTag: 'label', parentClass: 'imds-accordion-title',
    severity: 'error',
    message: 'span.imds-accordion-title-inner の直接の親は label.imds-accordion-title でなければなりません'
  },
  {
    id: 'IMDS-ACCORDION-103', component: 'Accordion', type: 'parent',
    triggerTag: 'span', triggerClass: 'imds-accordion-chevron',
    depth: 'ancestor', parentTag: 'label', parentClass: 'imds-accordion-title',
    severity: 'error',
    message: 'span.imds-accordion-chevron は label.imds-accordion-title の子孫でなければなりません'
  },
  {
    id: 'IMDS-ACCORDION-200', component: 'Accordion', type: 'required-descendant',
    triggerClass: 'imds-accordion', triggerTag: 'div',
    requiredClass: 'imds-accordion-title',
    severity: 'error',
    message: 'div.imds-accordion 内に必須の imds-accordion-title がありません'
  },
  {
    id: 'IMDS-ACCORDION-201', component: 'Accordion', type: 'required-descendant',
    triggerClass: 'imds-accordion', triggerTag: 'div',
    requiredClass: 'imds-accordion-content',
    severity: 'error',
    message: 'div.imds-accordion 内に必須の imds-accordion-content がありません'
  },
  {
    id: 'IMDS-ACCORDION-202', component: 'Accordion', type: 'required-descendant',
    triggerClass: 'imds-accordion-title', triggerTag: 'label',
    requiredClass: 'imds-accordion-title-inner',
    severity: 'error',
    message: 'label.imds-accordion-title 内に必須の imds-accordion-title-inner がありません'
  },
  {
    id: 'IMDS-ACCORDION-203', component: 'Accordion', type: 'required-descendant',
    triggerClass: 'imds-accordion-title', triggerTag: 'label',
    requiredClass: 'imds-accordion-chevron',
    severity: 'error',
    message: 'label.imds-accordion-title 内に必須の imds-accordion-chevron がありません'
  },

  // ===========================================================
  // Popover (imds-popover)
  // ===========================================================
  {
    id: 'IMDS-POPOVER-001', component: 'Popover', type: 'tag-element',
    triggerClass: 'imds-popover', requiredTag: 'div',
    severity: 'error',
    message: 'imds-popover クラスは div 要素に付与してください'
  },
  {
    id: 'IMDS-POPOVER-002', component: 'Popover', type: 'tag-element',
    triggerClass: 'imds-popover-menu', requiredTag: 'div',
    severity: 'error',
    message: 'imds-popover-menu クラスは div 要素に付与してください'
  },
  {
    id: 'IMDS-POPOVER-003', component: 'Popover', type: 'tag-element',
    triggerClass: 'imds-popover-content', requiredTag: 'div',
    severity: 'error',
    message: 'imds-popover-content クラスは div 要素に付与してください'
  },
  {
    id: 'IMDS-POPOVER-100', component: 'Popover', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-popover-menu',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-popover',
    severity: 'error',
    message: 'div.imds-popover-menu の直接の親は div.imds-popover でなければなりません'
  },
  {
    id: 'IMDS-POPOVER-101', component: 'Popover', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-popover-content',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-popover-menu',
    severity: 'error',
    message: 'div.imds-popover-content の直接の親は div.imds-popover-menu でなければなりません'
  },
  {
    id: 'IMDS-POPOVER-200', component: 'Popover', type: 'required-descendant',
    triggerClass: 'imds-popover', triggerTag: 'div',
    requiredClass: 'imds-popover-menu',
    severity: 'error',
    message: 'div.imds-popover 内に必須の imds-popover-menu がありません'
  },
  {
    id: 'IMDS-POPOVER-201', component: 'Popover', type: 'required-descendant',
    triggerClass: 'imds-popover-menu', triggerTag: 'div',
    requiredClass: 'imds-popover-content',
    severity: 'error',
    message: 'div.imds-popover-menu 内に必須の imds-popover-content がありません'
  },

  // ===========================================================
  // Menu (imds-menu)
  // ===========================================================
  {
    id: 'IMDS-MENU-001', component: 'Menu', type: 'tag-element',
    triggerClass: 'imds-menu', requiredTag: 'nav',
    severity: 'error',
    message: 'imds-menu クラスは nav 要素に付与してください'
  },
  {
    id: 'IMDS-MENU-002', component: 'Menu', type: 'tag-element',
    triggerClass: 'imds-menu-list', requiredTag: 'ul',
    severity: 'error',
    message: 'imds-menu-list クラスは ul 要素に付与してください'
  },
  {
    id: 'IMDS-MENU-100', component: 'Menu', type: 'parent',
    triggerTag: 'ul', triggerClass: 'imds-menu-list',
    depth: 'direct', parentTag: 'nav', parentClass: 'imds-menu',
    severity: 'error',
    message: 'ul.imds-menu-list の直接の親は nav.imds-menu でなければなりません'
  },
  {
    id: 'IMDS-MENU-200', component: 'Menu', type: 'required-descendant',
    triggerClass: 'imds-menu', triggerTag: 'nav',
    requiredClass: 'imds-menu-list',
    severity: 'error',
    message: 'nav.imds-menu 内に必須の imds-menu-list がありません'
  },

  // ===========================================================
  // FileUpload (imds-file-upload)
  // ===========================================================
  {
    id: 'IMDS-FILE-UPLOAD-001', component: 'FileUpload', type: 'tag-element',
    triggerClass: 'imds-file-upload', requiredTag: 'div',
    severity: 'error',
    message: 'imds-file-upload クラスは div 要素に付与してください'
  },
  {
    id: 'IMDS-FILE-UPLOAD-002', component: 'FileUpload', type: 'tag-element',
    triggerClass: 'imds-file-upload-drop-area', requiredTag: 'div',
    severity: 'error',
    message: 'imds-file-upload-drop-area クラスは div 要素に付与してください'
  },
  {
    id: 'IMDS-FILE-UPLOAD-003', component: 'FileUpload', type: 'tag-element',
    triggerClass: 'imds-file-upload-message', requiredTag: 'p',
    severity: 'error',
    message: 'imds-file-upload-message クラスは p 要素に付与してください'
  },
  {
    id: 'IMDS-FILE-UPLOAD-100', component: 'FileUpload', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-file-upload-drop-area',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-file-upload',
    severity: 'error',
    message: 'div.imds-file-upload-drop-area の直接の親は div.imds-file-upload でなければなりません'
  },
  {
    id: 'IMDS-FILE-UPLOAD-101', component: 'FileUpload', type: 'parent',
    triggerTag: 'p', triggerClass: 'imds-file-upload-message',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-file-upload-drop-area',
    severity: 'error',
    message: 'p.imds-file-upload-message の直接の親は div.imds-file-upload-drop-area でなければなりません'
  },
  {
    id: 'IMDS-FILE-UPLOAD-200', component: 'FileUpload', type: 'required-descendant',
    triggerClass: 'imds-file-upload', triggerTag: 'div',
    requiredClass: 'imds-file-upload-drop-area',
    severity: 'error',
    message: 'div.imds-file-upload 内に必須の imds-file-upload-drop-area がありません'
  },
  {
    id: 'IMDS-FILE-UPLOAD-201', component: 'FileUpload', type: 'required-descendant',
    triggerClass: 'imds-file-upload-drop-area', triggerTag: 'div',
    requiredClass: 'imds-file-upload-message',
    severity: 'error',
    message: 'div.imds-file-upload-drop-area 内に必須の imds-file-upload-message がありません'
  },

  // ===========================================================
  // Stepper (imds-stepper)
  // ===========================================================
  {
    id: 'IMDS-STEPPER-001', component: 'Stepper', type: 'tag-element',
    triggerClass: 'imds-stepper', requiredTag: 'div',
    severity: 'error',
    message: 'imds-stepper クラスは div 要素に付与してください'
  },
  {
    id: 'IMDS-STEPPER-002', component: 'Stepper', type: 'tag-element',
    triggerClass: 'imds-stepper-step', requiredTag: 'li',
    severity: 'error',
    message: 'imds-stepper-step クラスは li 要素に付与してください'
  },
  {
    id: 'IMDS-STEPPER-100', component: 'Stepper', type: 'parent',
    triggerTag: 'li', triggerClass: 'imds-stepper-step',
    depth: 'ancestor', parentTag: 'div', parentClass: 'imds-stepper',
    severity: 'error',
    message: 'li.imds-stepper-step は div.imds-stepper の子孫でなければなりません'
  },
  {
    id: 'IMDS-STEPPER-101', component: 'Stepper', type: 'parent',
    triggerTag: 'li', triggerClass: 'imds-stepper-step',
    depth: 'direct', parentTag: 'ul', parentClass: null,
    severity: 'error',
    message: 'li.imds-stepper-step の直接の親は ul でなければなりません'
  },
  {
    id: 'IMDS-STEPPER-200', component: 'Stepper', type: 'required-descendant',
    triggerClass: 'imds-stepper', triggerTag: 'div',
    requiredClass: 'imds-stepper-step',
    severity: 'error',
    message: 'div.imds-stepper 内に必須の imds-stepper-step がありません'
  },

  // ===========================================================
  // ProgressBar (imds-progress-bar)
  // ===========================================================
  {
    id: 'IMDS-PROGRESS-BAR-001', component: 'ProgressBar', type: 'tag-element',
    triggerClass: 'imds-progress-bar', requiredTag: 'div',
    severity: 'error',
    message: 'imds-progress-bar クラスは div 要素に付与してください'
  },
  {
    id: 'IMDS-PROGRESS-BAR-002', component: 'ProgressBar', type: 'tag-element',
    triggerClass: 'imds-progress-bar-track', requiredTag: 'div',
    severity: 'error',
    message: 'imds-progress-bar-track クラスは div 要素に付与してください'
  },
  {
    id: 'IMDS-PROGRESS-BAR-003', component: 'ProgressBar', type: 'tag-element',
    triggerClass: 'imds-progress-bar-fill', requiredTag: 'div',
    severity: 'error',
    message: 'imds-progress-bar-fill クラスは div 要素に付与してください'
  },
  {
    id: 'IMDS-PROGRESS-BAR-100', component: 'ProgressBar', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-progress-bar-track',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-progress-bar',
    severity: 'error',
    message: 'div.imds-progress-bar-track の直接の親は div.imds-progress-bar でなければなりません'
  },
  {
    id: 'IMDS-PROGRESS-BAR-101', component: 'ProgressBar', type: 'parent',
    triggerTag: 'div', triggerClass: 'imds-progress-bar-fill',
    depth: 'direct', parentTag: 'div', parentClass: 'imds-progress-bar-track',
    severity: 'error',
    message: 'div.imds-progress-bar-fill の直接の親は div.imds-progress-bar-track でなければなりません'
  },
  {
    id: 'IMDS-PROGRESS-BAR-200', component: 'ProgressBar', type: 'required-descendant',
    triggerClass: 'imds-progress-bar', triggerTag: 'div',
    requiredClass: 'imds-progress-bar-track',
    severity: 'error',
    message: 'div.imds-progress-bar 内に必須の imds-progress-bar-track がありません'
  },
  {
    id: 'IMDS-PROGRESS-BAR-201', component: 'ProgressBar', type: 'required-descendant',
    triggerClass: 'imds-progress-bar-track', triggerTag: 'div',
    requiredClass: 'imds-progress-bar-fill',
    severity: 'error',
    message: 'div.imds-progress-bar-track 内に必須の imds-progress-bar-fill がありません'
  },

  // ===========================================================
  // Tag (imds-tag)
  // ===========================================================
  {
    id: 'IMDS-TAG-001', component: 'Tag', type: 'tag-element',
    triggerClass: 'imds-tag', requiredTag: 'span',
    severity: 'error',
    message: 'imds-tag クラスは span 要素に付与してください（正しい構造: span.imds-tag > span）'
  },

  // ===========================================================
  // Icon (imds-icon)
  // ===========================================================
  {
    id: 'IMDS-ICON-001', component: 'Icon', type: 'tag-element',
    triggerClass: 'imds-icon', requiredTag: 'span',
    severity: 'error',
    message: 'imds-icon クラスは span 要素に付与してください（<i> ではなく、その外側の <span> に付与）'
  },

  // ===========================================================
  // Form (imds-form)
  // ===========================================================
  {
    id: 'IMDS-FORM-001', component: 'Form', type: 'tag-element',
    triggerClass: 'imds-form', requiredTag: 'form',
    // <imart type="workflowOpenPage"> は実行時に <form> を生成するため、その内部で
    // <form class="imds-form"> を書くとネストし、HTML5 パーサが内側の <form> 開始タグを
    // 無視してしまう（class も適用されない）。やむを得ず <div class="imds-form"> に
    // 付与する運用となるため、workflowOpenPage を含むファイルではこのルールをスキップする。
    skipIfFileContains: '<imart type="workflowOpenPage"',
    severity: 'error',
    message: 'imds-form クラスは form 要素に付与してください（div への付与は不可）'
  },

  // ===========================================================
  // FieldContainer (imds-field-container)
  // ===========================================================
  {
    id: 'IMDS-FIELD-CONTAINER-001', component: 'FieldContainer', type: 'tag-element',
    triggerClass: 'imds-field-container', requiredTag: 'div',
    severity: 'error',
    message: 'imds-field-container クラスは div 要素に付与してください'
  },

  // ===========================================================
  // Divider (imds-divider)
  // ===========================================================
  {
    id: 'IMDS-DIVIDER-001', component: 'Divider', type: 'tag-element',
    triggerClass: 'imds-divider', requiredTag: 'div',
    severity: 'error',
    message: 'imds-divider クラスは div 要素に付与してください（<hr> ではなく <div>）'
  },

  // ===========================================================
  // Csjs (Client-Side JavaScript polyfill 必須シンボル)
  // ===========================================================
  // type: 'js-symbol-required' のフィールド:
  //   symbol  {string}  対象シンボル名（関数名）
  // 検出: 呼び出し `<symbol>(` があるのに、関数定義 `function <symbol>(` がないファイルをエラー。
  // プラットフォーム提供されないため、各画面で polyfill 実装が必要なシンボル用。
  {
    id: 'IMDS-CSJS-001', component: 'Csjs', type: 'js-symbol-required',
    symbol: 'imdsConfirm',
    severity: 'error',
    message: 'imdsConfirm を呼び出していますが、関数定義がありません。imdsConfirm はプラットフォーム提供されないため、各画面で polyfill 実装（function imdsConfirm(...) { ... }）が必要です'
  }
];

// ========================================
// 既知 imds-* クラス収集
// ========================================
// .claude/skills/ 配下、.claude/rules/ 配下、
// .github/skills/ 配下、.github/instructions/ 配下の *.md から
// `imds-*` 形式のクラス名を抽出し、未定義クラス検出
// (IMDS-UNKNOWN-001) の根拠とする。
//
// 抽出範囲・除外ポリシーは validate-imds.js v1 と同じ。
// 存在しないディレクトリは無視するため、.claude のみ / .github のみの
// リポジトリ構成でも動作する。

const KNOWN_INVALID_CLASSES = new Set([
  // ページヘッダの誤称（正: imds-header / imds-header-title / imds-header-actions）
  'imds-page-header',
  'imds-page-header-title',
  'imds-page-header-actions',
  // セクションタイトルの独自命名
  'imds-section-title',
  // ダイアログ構造の誤称
  'imds-dialog-body',
  'imds-dialog-header-title',
  'imds-dialog-overlay',
  // 必須マークの誤称
  'imds-required-mark'
]);

// imds spacing utility（padding / margin）の許容パターン
//   imds-p-N / imds-pt-N / imds-pb-N / imds-pl-N / imds-pr-N / imds-px-N / imds-py-N
//   imds-m-N / imds-mt-N / imds-mb-N / imds-ml-N / imds-mr-N / imds-mx-N / imds-my-N
// reference には個別記載が無いがプロジェクト全体で使われるユーティリティ群。
// 未定義クラス警告（IMDS-UNKNOWN-001）の対象から除外する。
const IMDS_SPACING_UTILITY_RE = /^imds-[pm][tblrxy]?-\d+$/;

function loadKnownImdsClasses() {
  const known = new Set();
  // __dirname = .claude/skills/jssp-imds-theme/scripts
  // ../../../../ = リポジトリルート
  const repoRoot = path.join(__dirname, '..', '..', '..', '..');
  const searchDirs = [
    path.join(repoRoot, '.claude', 'skills'),               // .claude/skills/
    path.join(repoRoot, '.claude', 'rules'),                // .claude/rules/
    path.join(repoRoot, '.github', 'skills'),               // .github/skills/
    path.join(repoRoot, '.github', 'instructions')          // .github/instructions/
  ];

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;
    let entries;
    try {
      entries = fs.readdirSync(dir, { recursive: true });
    } catch (e) {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry);
      let stat;
      try {
        stat = fs.statSync(full);
      } catch (e) {
        continue;
      }
      if (!stat.isFile()) continue;
      if (!full.endsWith('.md')) continue;
      // SKILL.md は誤りパターン記述を含むため除外
      if (path.basename(full) === 'SKILL.md') continue;
      const content = fs.readFileSync(full, 'utf-8');
      const matches = content.match(/imds-[a-z][a-z0-9-]*/g) || [];
      for (const cls of matches) known.add(cls);
    }
  }

  for (const cls of KNOWN_INVALID_CLASSES) known.delete(cls);
  return known;
}

// ========================================
// HTML void 要素
// ========================================
const VOID_ELEMENTS = [
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
];

// ========================================
// パーサ補助
// ========================================
function offsetToLine(lineOffsets, offset) {
  let lo = 0;
  let hi = lineOffsets.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineOffsets[mid] <= offset) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo + 1;
}

function stripNonStructural(content) {
  let result = content.replace(/<!--[\s\S]*?-->/g, function(m) {
    return m.replace(/[^\n]/g, ' ');
  });
  result = result.replace(/(<(?:script|style)\b[^>]*>)([\s\S]*?)(<\/(?:script|style)>)/gi,
    function(m, open, body, close) {
      return open + body.replace(/[^\n]/g, ' ') + close;
    }
  );
  return result;
}

function extractClasses(attrsStr) {
  const m = attrsStr.match(/\bclass\s*=\s*["']([^"']+)["']/);
  if (!m) return [];
  return m[1].trim().split(/\s+/);
}

function hasAncestorWithClass(stack, cls) {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].classes.indexOf(cls) !== -1) return true;
  }
  return false;
}

/**
 * 親条件（direct / ancestor）をスタックに対して検証する。
 * IMDS-FIELD-102 / IMDS-FIELD-103（help/error-text）は parentClass が
 * imds-field でも imds-field-group でも OK なので OR 評価する。
 */
function checkParent(stack, rule) {
  const isHelpOrError = (rule.id === 'IMDS-FIELD-102' || rule.id === 'IMDS-FIELD-103');

  if (rule.depth === 'direct') {
    if (stack.length === 0) return false;
    const parent = stack[stack.length - 1];
    if (rule.parentTag && parent.tag !== rule.parentTag) return false;
    if (rule.parentClass && parent.classes.indexOf(rule.parentClass) === -1) return false;
    return true;
  }

  // depth === 'ancestor'
  for (let i = stack.length - 1; i >= 0; i--) {
    const anc = stack[i];
    const tagOk = !rule.parentTag || anc.tag === rule.parentTag;
    const clsOk = !rule.parentClass || anc.classes.indexOf(rule.parentClass) !== -1;
    if (tagOk && clsOk) return true;
    if (isHelpOrError && anc.classes.indexOf('imds-field-group') !== -1) return true;
  }
  return false;
}

// ========================================
// ルールのインデックス化
// ========================================
function indexRules(rules) {
  const tagElement = [];       // type: 'tag-element'
  const parent = [];           // type: 'parent'
  // requiredDescendantsByClass: triggerClass -> rule[]
  const requiredDescendantsByClass = Object.create(null);
  const jsSymbol = [];         // type: 'js-symbol-required'

  for (const r of rules) {
    if (r.type === 'tag-element') {
      tagElement.push(r);
    } else if (r.type === 'parent') {
      parent.push(r);
    } else if (r.type === 'required-descendant') {
      if (!requiredDescendantsByClass[r.triggerClass]) {
        requiredDescendantsByClass[r.triggerClass] = [];
      }
      requiredDescendantsByClass[r.triggerClass].push(r);
    } else if (r.type === 'js-symbol-required') {
      jsSymbol.push(r);
    }
  }
  return { tagElement, parent, requiredDescendantsByClass, jsSymbol };
}

/**
 * js-symbol-required ルールを 1 ファイル全体に対して検査する。
 *
 * シンボル呼び出し（例: `imdsConfirm(`）があるのに、関数定義（例: `function imdsConfirm(`）が
 * ファイル内に存在しない場合をエラーとする。
 * プラットフォーム提供されない polyfill 必須シンボルの実装漏れを検出するために使用する。
 *
 * 検出は HTML コメント除去後の生コンテンツに対して行う（<script> 内も対象）。
 */
function validateJsSymbols(filePath, raw, rules, lines) {
  const findings = [];
  // HTML コメントのみ除去（<script>/<style> の中身は残す）
  const sanitized = raw.replace(/<!--[\s\S]*?-->/g, function(m) {
    return m.replace(/[^\n]/g, ' ');
  });

  for (const rule of rules) {
    const symbol = rule.symbol;
    // 識別子境界を考慮: 直前が英数字/_/$/. でない位置からの呼び出し
    const callRe = new RegExp('(^|[^A-Za-z0-9_$.])' + symbol + '\\s*\\(', 'g');
    // 関数定義: function <symbol>(
    const defRe  = new RegExp('function\\s+' + symbol + '\\s*\\(', 'g');

    const calls = sanitized.match(callRe) || [];
    const defs  = sanitized.match(defRe)  || [];

    // 呼び出し回数は、定義行も呼び出しパターンにマッチするため、
    // 実際の呼び出し数 = calls.length - defs.length。
    const trueCallCount = calls.length - defs.length;
    if (trueCallCount > 0 && defs.length === 0) {
      // 最初の呼び出し行を特定
      let firstCallLine = 1;
      const singleCallRe = new RegExp('(^|[^A-Za-z0-9_$.])' + symbol + '\\s*\\(');
      const singleDefRe  = new RegExp('function\\s+' + symbol + '\\s*\\(');
      for (let i = 0; i < lines.length; i++) {
        if (singleCallRe.test(lines[i]) && !singleDefRe.test(lines[i])) {
          firstCallLine = i + 1;
          break;
        }
      }
      findings.push({
        file: filePath,
        line: firstCallLine,
        ruleId: rule.id,
        component: rule.component,
        severity: rule.severity || 'error',
        message: rule.message,
        matchedText: (lines[firstCallLine - 1] || '').trim().substring(0, 80)
      });
    }
  }
  return findings;
}

// ========================================
// HTML 1ファイル検証
// ========================================
/**
 * @param {string} filePath
 * @param {Array}  rules
 * @param {Set<string>=} knownClasses 既知 imds-* クラスのセット
 * @returns {Array} findings
 */
function validateImds(filePath, rules, knownClasses) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const content = stripNonStructural(raw);
  const lines = raw.split('\n');

  // 行番号ルックアップ用
  const lineOffsets = [0];
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '\n') lineOffsets.push(i + 1);
  }

  const { tagElement, parent, requiredDescendantsByClass, jsSymbol } = indexRules(rules);

  const findings = [];

  // --- js-symbol-required ルール（ファイル全体を対象に 1 度だけ実行）---
  if (jsSymbol.length > 0) {
    const jsFindings = validateJsSymbols(filePath, raw, jsSymbol, lines);
    for (const f of jsFindings) findings.push(f);
  }

  // スタック要素:
  //   { tag, classes, lineNum,
  //     pendingRequired: [{ rule }],     // 自身がコンポーネントルートで満たすべきルール
  //     seenChildClasses: Set<string> }  // 子孫で観測した imds-* クラスの蓄積
  const stack = [];

  // <tag attrs> / </tag> / <tag attrs /> をトークン化
  const tokenRe = /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)\s*(\/?)>/g;
  let m;

  while ((m = tokenRe.exec(content)) !== null) {
    const isClose   = m[1] === '/';
    const tagLower  = m[2].toLowerCase();
    const attrsStr  = m[3];
    const selfClose = m[4] === '/';
    const offset    = m.index;
    const lineNum   = offsetToLine(lineOffsets, offset);
    const rawLine   = lines[lineNum - 1] || '';
    const matched   = rawLine.trim().substring(0, 80);

    if (isClose) {
      // 対応する開きタグまで巻き戻す
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tagLower) {
          // この要素を閉じる: 必須子孫の検証
          const closing = stack[i];
          if (closing.pendingRequired && closing.pendingRequired.length > 0) {
            for (const pr of closing.pendingRequired) {
              if (!closing.seenChildClasses.has(pr.rule.requiredClass)) {
                findings.push({
                  file: filePath,
                  line: closing.lineNum,
                  ruleId: pr.rule.id,
                  component: pr.rule.component,
                  severity: pr.rule.severity || 'error',
                  message: pr.rule.message,
                  matchedText: pr.openText
                });
              }
            }
          }

          // 子孫情報を親に伝搬
          if (i > 0) {
            const parentEntry = stack[i - 1];
            for (const cls of closing.classes) {
              if (cls.indexOf('imds-') === 0) parentEntry.seenChildClasses.add(cls);
            }
            for (const cls of closing.seenChildClasses) {
              parentEntry.seenChildClasses.add(cls);
            }
          }

          stack.length = i;
          break;
        }
      }
      continue;
    }

    // imart タグは構造解析の透過要素として扱う
    if (tagLower === 'imart') {
      continue;
    }

    const skipStackPush = (selfClose || VOID_ELEMENTS.indexOf(tagLower) !== -1);
    const classes = extractClasses(attrsStr);

    // --- 未定義 imds-* クラス検出（IMDS-UNKNOWN-001 / warning）---
    if (knownClasses && knownClasses.size > 0) {
      for (const cls of classes) {
        if (cls.indexOf('imds-') !== 0) continue;
        if (knownClasses.has(cls)) continue;
        // spacing utility（imds-py-3 等）は許容パターンなのでスキップ
        if (IMDS_SPACING_UTILITY_RE.test(cls)) continue;
        findings.push({
          file: filePath,
          line: lineNum,
          ruleId: 'IMDS-UNKNOWN-001',
          component: 'Unknown',
          severity: 'warning',
          message: '未定義の imds-* クラス "' + cls + '" が使われています。リファレンス（skills/jssp-imds-theme/reference/）に記載されたクラス名を使用してください',
          matchedText: matched
        });
      }
    }

    // --- tag-element ルール ---
    for (const rule of tagElement) {
      if (classes.indexOf(rule.triggerClass) === -1) continue;
      if (rule.skipIfFileContains && raw.indexOf(rule.skipIfFileContains) !== -1) continue;
      if (tagLower !== rule.requiredTag) {
        findings.push({
          file: filePath,
          line: lineNum,
          ruleId: rule.id,
          component: rule.component,
          severity: rule.severity || 'error',
          message: rule.message,
          matchedText: matched
        });
      }
    }

    // --- parent ルール ---
    for (const rule of parent) {
      if (rule.triggerTag && tagLower !== rule.triggerTag) continue;
      if (rule.triggerClass && classes.indexOf(rule.triggerClass) === -1) continue;
      if (rule.contextClass && !hasAncestorWithClass(stack, rule.contextClass)) continue;
      if (!checkParent(stack, rule)) {
        findings.push({
          file: filePath,
          line: lineNum,
          ruleId: rule.id,
          component: rule.component,
          severity: rule.severity || 'error',
          message: rule.message,
          matchedText: matched
        });
      }
    }

    // --- スタック push & required-descendant 準備 ---
    if (!skipStackPush) {
      const entry = {
        tag: tagLower,
        classes: classes,
        lineNum: lineNum,
        pendingRequired: [],
        seenChildClasses: new Set()
      };

      // この要素が required-descendant のトリガクラスを持っていれば、
      // 閉じタグ時に検証するためのルールを記憶する。
      for (const cls of classes) {
        const ruleList = requiredDescendantsByClass[cls];
        if (!ruleList) continue;
        for (const r of ruleList) {
          if (r.triggerTag && r.triggerTag !== tagLower) continue;
          // skipIfContext: 指定クラスが祖先にある場合はチェックしない
          if (r.skipIfContext && hasAncestorWithClass(stack, r.skipIfContext)) continue;
          entry.pendingRequired.push({ rule: r, openText: matched });
        }
      }

      stack.push(entry);
    } else {
      // void/self-closing 要素は親の seenChildClasses にだけ反映
      if (stack.length > 0) {
        const parentEntry = stack[stack.length - 1];
        for (const cls of classes) {
          if (cls.indexOf('imds-') === 0) parentEntry.seenChildClasses.add(cls);
        }
      }
    }
  }

  // ファイル終端まで閉じられなかった要素の pendingRequired も評価する
  // （HTML が壊れていなければ通常ここには来ない）
  while (stack.length > 0) {
    const top = stack.pop();
    if (top.pendingRequired && top.pendingRequired.length > 0) {
      for (const pr of top.pendingRequired) {
        if (!top.seenChildClasses.has(pr.rule.requiredClass)) {
          findings.push({
            file: filePath,
            line: top.lineNum,
            ruleId: pr.rule.id,
            component: pr.rule.component,
            severity: pr.rule.severity || 'error',
            message: pr.rule.message,
            matchedText: pr.openText
          });
        }
      }
    }
    if (stack.length > 0) {
      const parentEntry = stack[stack.length - 1];
      for (const cls of top.classes) {
        if (cls.indexOf('imds-') === 0) parentEntry.seenChildClasses.add(cls);
      }
      for (const cls of top.seenChildClasses) {
        parentEntry.seenChildClasses.add(cls);
      }
    }
  }

  return findings;
}

// ========================================
// ディレクトリ・ファイル収集
// ========================================
function collectHtmlFiles(targetPath) {
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    return targetPath.endsWith('.html') ? [targetPath] : [];
  }
  const files = [];
  const entries = fs.readdirSync(targetPath, { recursive: true });
  for (const entry of entries) {
    const full = path.join(targetPath, entry);
    if (fs.statSync(full).isFile() && full.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

// ========================================
// CLI 実行
// ========================================
function runImdsValidation(targetPath, rules) {
  rules = rules || IMDS_RULES;
  const files = collectHtmlFiles(targetPath);

  if (files.length === 0) {
    console.log('No .html files found in ' + targetPath);
    return { errors: 0, warnings: 0, fileCount: 0, findings: [] };
  }

  const knownClasses = loadKnownImdsClasses();

  const allFindings = [];
  for (const file of files) {
    const fs2 = validateImds(file, rules, knownClasses);
    for (const f of fs2) allFindings.push(f);
  }

  const errors   = allFindings.filter(function(f) { return f.severity === 'error'; });
  const warnings = allFindings.filter(function(f) { return f.severity === 'warning'; });

  // コンポーネント別カウント
  const byComponent = Object.create(null);
  for (const f of allFindings) {
    const key = f.component || 'Unknown';
    if (!byComponent[key]) byComponent[key] = { error: 0, warning: 0 };
    byComponent[key][f.severity] = (byComponent[key][f.severity] || 0) + 1;
  }

  if (allFindings.length === 0) {
    console.log('PASS: ' + files.length + ' file(s) checked, 0 imds structural issue(s)');
  } else {
    for (const finding of allFindings) {
      const icon = finding.severity === 'error' ? 'ERROR' : 'WARN ';
      console.log(icon + ' [' + finding.ruleId + '] ' + finding.file + ':' + finding.line);
      console.log('       ' + finding.message);
      console.log('       > ' + finding.matchedText);
      console.log();
    }
    console.log('=== Summary by Component ===');
    const compNames = Object.keys(byComponent).sort();
    for (const name of compNames) {
      const c = byComponent[name];
      const e = c.error || 0;
      const w = c.warning || 0;
      console.log('  ' + name.padEnd(18) + ' : ' + e + ' error(s), ' + w + ' warning(s)');
    }
    console.log('');
    console.log('Result: ' + errors.length + ' error(s), ' + warnings.length + ' warning(s) in ' + files.length + ' file(s)');
  }

  return {
    errors: errors.length,
    warnings: warnings.length,
    fileCount: files.length,
    findings: allFindings,
    byComponent: byComponent
  };
}

if (require.main === module) {
  const targetPath = process.argv[2];
  if (!targetPath) {
    console.error('Usage: node validate-imds.js <directory-or-file>');
    process.exit(2);
  }
  if (!fs.existsSync(targetPath)) {
    console.error('Path not found: ' + targetPath);
    process.exit(2);
  }
  const result = runImdsValidation(targetPath, IMDS_RULES);
  process.exit(result.errors > 0 ? 1 : 0);
}

module.exports = {
  IMDS_RULES,
  validateImds,
  runImdsValidation,
  loadKnownImdsClasses
};
