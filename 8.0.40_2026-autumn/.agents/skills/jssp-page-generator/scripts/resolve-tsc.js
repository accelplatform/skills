#!/usr/bin/env node
// スキルの依存（.accel/ensure.mjs がインストール）に含まれる typescript の tsc 実行ファイルを、
// このファイル自身の位置を起点とした上方探索（Node の通常の require 解決）で特定する。
console.log(require.resolve('typescript/bin/tsc'));
