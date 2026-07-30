#!/bin/bash
# d.ts 型定義を使った JSSP JavaScript ファイルの補助型チェック
#
# 抑制するエラー:
#   TS2304 - d.ts に存在しないクラス・関数（SSJS 実行時に動く可能性あり）
#   TS2451/TS6200 - JSSP バインド変数の再宣言（各ファイルが独立スコープのため誤検知）
#   type 'unknown'/'any' 上のプロパティエラー（TypeScript の型推論が落ちた誤検知）

if [ "$#" -gt 1 ]; then
  echo "Error: このスクリプトは 1 個のパス（ディレクトリまたは単一ファイル）のみ受け付けます。" >&2
  echo "  渡されたパス: $1" >&2
  echo "  無視される追加引数: ${*:2}" >&2
  echo "" >&2
  echo "複数ファイルをまとめて検証する場合は、個々のファイルではなく共通の親ディレクトリを渡してください。" >&2
  exit 2
fi

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
