#!/usr/bin/env node
/*
 * validate-xml-encoding.js — IM-Workflow インポート XML のエンコーディング検証・修復
 *
 * 使い方:
 *   node validate-xml-encoding.js <import.xml>
 *
 * IM-Workflow インポート XML は UTF-16（BOM 付き）で保存する必要がある。
 * LE / BE どちらの UTF-16 も IM-Workflow が読めるが、BOM がない / UTF-8 のままだと
 * 取り込めない。生成時に以下の破損が発生し得るので、それを検出・修復する。
 *
 *   1. BOM なし UTF-16LE              → LE BOM を付与
 *   2. BOM なし UTF-16BE              → BE BOM を付与
 *   3. UTF-8（BOM 付き / なし）        → UTF-16LE に変換（既定）
 *   4. 二重 BOM（LE / BE）             → 先頭の余分な BOM を除去
 *   5. encoding="UTF-16" 欠落          → WARN
 *   6. </data> で終わっていない        → ERROR
 *
 * 終了コード: 成功（OK / FIXED）=0、致命的エラー=1
 */

const fs = require('fs');

function decodeBE(buf) {
  return new TextDecoder('utf-16be').decode(buf);
}

function encodeBE(str) {
  const le = Buffer.from(str, 'utf16le');
  const be = Buffer.alloc(le.length);
  for (let i = 0; i + 1 < le.length; i += 2) {
    be[i] = le[i + 1];
    be[i + 1] = le[i];
  }
  return be;
}

function writeWithBOM(file, content, endian) {
  if (endian === 'be') {
    const bom = Buffer.from([0xFE, 0xFF]);
    fs.writeFileSync(file, Buffer.concat([bom, encodeBE(content)]));
  } else {
    const bom = Buffer.from([0xFF, 0xFE]);
    fs.writeFileSync(file, Buffer.concat([bom, Buffer.from(content, 'utf16le')]));
  }
}

function main() {
  const file = process.argv[2];
  if (!file || !fs.existsSync(file)) {
    console.error('ERROR: file not found:', file);
    process.exit(1);
  }

  const buf = fs.readFileSync(file);
  let fixed = false;
  let content;
  let outEndian = 'le'; // 修復時の書き戻しエンディアン（既定 LE）

  const hasDoubleBOM_LE = buf[0] === 0xFF && buf[1] === 0xFE && buf[2] === 0xFF && buf[3] === 0xFE;
  const hasDoubleBOM_BE = buf[0] === 0xFE && buf[1] === 0xFF && buf[2] === 0xFE && buf[3] === 0xFF;
  const hasBOM_UTF16LE  = buf[0] === 0xFF && buf[1] === 0xFE;
  const hasBOM_UTF16BE  = buf[0] === 0xFE && buf[1] === 0xFF;
  const hasBOM_UTF8     = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  const isUTF16LE_noBOM = buf[0] === 0x3C && buf[1] === 0x00;
  const isUTF16BE_noBOM = buf[0] === 0x00 && buf[1] === 0x3C;
  const isUTF8_noBOM    = buf[0] === 0x3C && buf[1] !== 0x00;

  if (hasDoubleBOM_LE) {
    console.log('FIX: double BOM (LE) detected, removing extra BOM');
    content = buf.slice(4).toString('utf16le');
    outEndian = 'le';
    fixed = true;
  } else if (hasDoubleBOM_BE) {
    console.log('FIX: double BOM (BE) detected, removing extra BOM');
    content = decodeBE(buf.slice(4));
    outEndian = 'be';
    fixed = true;
  } else if (hasBOM_UTF16LE) {
    content = buf.slice(2).toString('utf16le');
    outEndian = 'le';
  } else if (hasBOM_UTF16BE) {
    content = decodeBE(buf.slice(2));
    outEndian = 'be';
  } else if (hasBOM_UTF8) {
    console.log('FIX: UTF-8 BOM detected, converting to UTF-16LE');
    content = buf.slice(3).toString('utf8');
    outEndian = 'le';
    fixed = true;
  } else if (isUTF16LE_noBOM) {
    console.log('FIX: UTF-16LE without BOM, adding BOM');
    content = buf.toString('utf16le');
    outEndian = 'le';
    fixed = true;
  } else if (isUTF16BE_noBOM) {
    console.log('FIX: UTF-16BE without BOM, adding BOM');
    content = decodeBE(buf);
    outEndian = 'be';
    fixed = true;
  } else if (isUTF8_noBOM) {
    console.log('FIX: UTF-8 (no BOM) detected, converting to UTF-16LE');
    content = buf.toString('utf8');
    outEndian = 'le';
    fixed = true;
  } else {
    console.error('ERROR: unknown encoding (first bytes: ' +
      buf[0].toString(16) + ' ' + buf[1].toString(16) + ')');
    process.exit(1);
  }

  if (!content.includes('encoding="UTF-16"')) {
    console.error('WARN: XML declaration missing encoding="UTF-16"');
  }
  if (!content.trimEnd().endsWith('</data>')) {
    console.error('ERROR: file does not end with </data> - file may be truncated');
    process.exit(1);
  }

  if (fixed) {
    writeWithBOM(file, content, outEndian);
    console.log('FIXED:', file);
  } else {
    console.log('OK:', file);
  }
}

if (require.main === module) main();
