#!/bin/bash
# d.ts 型定義を使った JSSP JavaScript ファイルの補助型チェック
#
# 使い方: check-types.sh [対象のディレクトリまたはファイル]（省略時は src/main/jssp/src）
#
# プロジェクトルートは、対象から上位へたどって最初に見つかった tsconfig.check.json のあるディレクトリとする
# （スキルの配置場所とプロジェクトの位置関係には依存しない）。
#
# 抑制するエラー:
#   TS2304 - d.ts に存在しないクラス・関数（SSJS 実行時に動く可能性あり）
#   TS2451/TS6200 - JSSP バインド変数の再宣言（各ファイルが独立スコープのため誤検知）
#   type 'unknown'/'any' 上のプロパティエラー（TypeScript の型推論が落ちた誤検知）
#
# 終了コード:
#   0 - エラーなし
#   1 - 型エラーあり
#   2 - 検査できなかった（引数の誤り・tsconfig.check.json が見つからない・tsc の設定エラー・対象が検査範囲外）

if [ "$#" -gt 1 ]; then
  echo "Error: このスクリプトは 1 個のパス（ディレクトリまたは単一ファイル）のみ受け付けます。" >&2
  echo "  渡されたパス: $1" >&2
  echo "  無視される追加引数: ${*:2}" >&2
  echo "" >&2
  echo "複数ファイルをまとめて検証する場合は、個々のファイルではなく共通の親ディレクトリを渡してください。" >&2
  exit 2
fi

TARGET="${1:-src/main/jssp/src}"

if [ ! -e "$TARGET" ]; then
  echo "Error: 対象が見つかりません: $TARGET" >&2
  exit 2
fi

# 対象の絶対パス（末尾の / は付けない）
if [ -d "$TARGET" ]; then
  TARGET_ABS="$(cd "$TARGET" && pwd)"
  SEARCH_DIR="$TARGET_ABS"
else
  SEARCH_DIR="$(cd "$(dirname "$TARGET")" && pwd)"
  TARGET_ABS="$SEARCH_DIR/$(basename "$TARGET")"
fi

# 対象から上位へたどり、tsconfig.check.json のあるディレクトリをプロジェクトルートとする
ROOT_DIR="$SEARCH_DIR"
while [ ! -f "$ROOT_DIR/tsconfig.check.json" ]; do
  if [ "$ROOT_DIR" = "/" ] || [ "$ROOT_DIR" = "$(dirname "$ROOT_DIR")" ]; then
    echo "Error: 対象（$TARGET）の上位ディレクトリに tsconfig.check.json が見つかりません。" >&2
    exit 2
  fi
  ROOT_DIR="$(dirname "$ROOT_DIR")"
done

# プロジェクトルートからの相対パス（tsc のエラー出力はこの形式になる）。対象がルート自身の場合は空
REL_TARGET="${TARGET_ABS#"$ROOT_DIR"}"
REL_TARGET="${REL_TARGET#/}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TSC_BIN="$(node "$SCRIPT_DIR/resolve-tsc.js")" || {
  echo "Error: typescript が解決できません。.claude/skills/jssp-page-generator/deps/ の依存インストールを確認してください。" >&2
  exit 2
}

cd "$ROOT_DIR" || exit 2

# --listFiles で検査したファイルの一覧も出力し、対象が実際に検査されたかを確認する
RAW="$(node "$TSC_BIN" -p tsconfig.check.json --listFiles 2>&1)"

# ファイルを特定できない tsc のエラーと、設定ファイル（tsconfig の誤り等）を指すエラーは、絞り込まずに検査失敗とする
FATAL="$(echo "$RAW" | grep "^error TS\|\.json([0-9]*,[0-9]*): error TS")"
if [ -n "$FATAL" ]; then
  echo "Error: tsc を実行できませんでした（プロジェクトルート: $ROOT_DIR）。" >&2
  echo "$FATAL" >&2
  exit 2
fi

# 検査したファイルのうち、対象に含まれるもの（一覧は絶対パス。区切りは / で出力される）
CHECKED_COUNT="$(echo "$RAW" | grep -v "error TS" | awk -v rel="$REL_TARGET" '
  rel == "" { if ($0 ~ /\.js$/) n++; next }
  { path = $0; gsub(/\\/, "/", path) }
  substr(path, length(path) - length(rel)) == "/" rel { n++; next }
  index(path, "/" rel "/") > 0 { n++ }
  END { print n + 0 }')"
if [ "$CHECKED_COUNT" -eq 0 ]; then
  echo "Error: 対象（$TARGET）のファイルが型チェックの対象に含まれていません。tsconfig.check.json の include を確認してください（プロジェクトルート: $ROOT_DIR）。" >&2
  exit 2
fi

# エラー行のうち、対象のもの（エラー行はプロジェクトルートからの相対パスで始まる）
FILTERED="$(echo "$RAW" \
  | grep "error TS" \
  | awk -v rel="$REL_TARGET" 'rel == "" || index($0, rel "/") == 1 || index($0, rel "(") == 1' \
  | grep -v "TS2304:" \
  | grep -v "TS2451:\|TS6200:" \
  | grep -v "type 'unknown'" \
  | grep -v "type 'any'")"

if [ -z "$FILTERED" ]; then
  echo "OK: 0 issues（$CHECKED_COUNT file(s) checked）"
  exit 0
else
  echo "$FILTERED"
  COUNT="$(echo "$FILTERED" | wc -l | tr -d ' ')"
  echo ""
  echo "FAIL: $COUNT issue(s) found"
  exit 1
fi
