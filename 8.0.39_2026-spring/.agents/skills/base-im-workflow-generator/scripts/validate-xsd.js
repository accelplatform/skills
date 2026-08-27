#!/usr/bin/env node
/*
 * validate-xsd.js — IM-Workflow インポート XML を XSD で構造検証する
 *
 * 使い方:
 *   node validate-xsd.js <import.xml>
 *
 * UTF-16LE / UTF-16BE / UTF-8 を自動判定して UTF-8 に正規化したうえで、
 * reference/im_workflow-import.xsd により xmllint-wasm で検証する。
 *
 * 前提:
 *   - Node.js v18 以降
 *   - xmllint-wasm が解決可能（プロジェクト直下に npm i --no-save xmllint-wasm 済み）
 *
 * 終了コード: 成功=0、失敗=1
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');

function main() {
  const xmlPath = process.argv[2];
  if (!xmlPath) {
    console.error('Usage: validate-xsd.js <import.xml>');
    process.exit(1);
  }

  const xsdPath = path.resolve(__dirname, '..', 'reference', 'im_workflow-import.xsd');
  if (!fs.existsSync(xsdPath)) {
    console.error('ERROR: XSD not found:', xsdPath);
    process.exit(1);
  }

  const xmlBuf = fs.readFileSync(xmlPath);
  let decoder;
  if (xmlBuf[0] === 0xff && xmlBuf[1] === 0xfe) decoder = new TextDecoder('utf-16le');
  else if (xmlBuf[0] === 0xfe && xmlBuf[1] === 0xff) decoder = new TextDecoder('utf-16be');
  else decoder = new TextDecoder('utf-8');
  let xml = decoder.decode(xmlBuf);
  if (xml.charCodeAt(0) === 0xFEFF) xml = xml.slice(1);
  xml = xml.replace(/encoding="UTF-16"/i, 'encoding="UTF-8"');
  const xsd = fs.readFileSync(xsdPath, 'utf8');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'xsd-'));
  const tmpXml = path.join(tmp, 'input.xml');
  const tmpXsd = path.join(tmp, 'schema.xsd');
  const tmpScript = path.join(tmp, 'validate.mjs');
  fs.writeFileSync(tmpXml, xml, 'utf8');
  fs.writeFileSync(tmpXsd, xsd, 'utf8');

  const xmllintUrl = pathToFileURL(require.resolve('xmllint-wasm/index-node.js')).href;
  fs.writeFileSync(tmpScript, [
    "import { readFileSync } from 'node:fs';",
    "import { validateXML } from '" + xmllintUrl + "';",
    "const xml = readFileSync('" + tmpXml.replace(/\\/g, '/') + "', 'utf8');",
    "const xsd = readFileSync('" + tmpXsd.replace(/\\/g, '/') + "', 'utf8');",
    "const result = await validateXML({ xml: [{ fileName: 'input.xml', contents: xml }], schema: [xsd] });",
    "if (result.valid) { console.log('XSD_OK'); }",
    "else { console.log('XSD_NG'); for (const e of (result.errors||[]).slice(0,30)) console.log('  ' + (e.message||e.rawMessage||e)); }"
  ].join('\n'), 'utf8');

  try {
    const out = execFileSync('node', [tmpScript], { encoding: 'utf8', timeout: 30000 });
    const lines = out.trim().split('\n');
    if (lines[0] === 'XSD_OK') {
      console.log('OK: ' + xmlPath + ' is valid against the schema');
    } else {
      console.log('NG: ' + xmlPath);
      for (const l of lines.slice(1)) console.log(l);
      process.exit(1);
    }
  } catch (e) {
    console.error(e.stdout || e.message);
    process.exit(1);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

if (require.main === module) main();
