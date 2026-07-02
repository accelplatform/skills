#!/bin/bash
# d.ts 型定義を使った JSSP JavaScript ファイルの補助型チェック
#
# 抑制するエラー:
#   TS2304 - d.ts に存在しないクラス・関数（SSJS 実行時に動く可能性あり）
#   TS2451/TS6200 - JSSP バインド変数の再宣言（各ファイルが独立スコープのため誤検知）
#   type 'unknown'/'any' 上のプロパティエラー（TypeScript の型推論が落ちた誤検知）

TARGET="${1:-src/main/jssp/src}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

cd "$ROOT_DIR"

RAW="$(node_modules/.bin/tsc -p tsconfig.check.json 2>&1)"

FILTERED="$(echo "$RAW" \
  | grep "$TARGET" \
  | grep -v "TS2304:" \
  | grep -v "TS2451:\|TS6200:" \
  | grep -v "type 'unknown'" \
  | grep -v "type 'any'")"

if [ -z "$FILTERED" ]; then
  echo "OK: 0 issues"
  exit 0
else
  echo "$FILTERED"
  COUNT="$(echo "$FILTERED" | wc -l | tr -d ' ')"
  echo ""
  echo "FAIL: $COUNT issue(s) found"
  exit 1
fi
