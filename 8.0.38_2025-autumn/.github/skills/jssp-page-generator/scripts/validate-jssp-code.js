#!/usr/bin/env node
/**
 * JSSP 生成コード共通検証スクリプト
 *
 * 生成された .js / .html ファイルに対して、JSSP 共通の不具合パターンを機械的に検出する。
 * 終了コード: 0=OK, 1=エラーあり
 *
 * 使い方:
 *   node validate-jssp-code.js <ディレクトリまたはファイル>
 *   node validate-jssp-code.js src/main/jssp/src/sample/
 *
 * 他スクリプトからの利用:
 *   const { COMMON_RULES, COMMON_FUNCTION_RULES, collectFiles, validateFile } = require('./validate-jssp-code.js');
 */
const fs = require('fs');
const path = require('path');

// ========================================
// 共通検証ルール（JSSP 全般）
// ========================================
const COMMON_RULES = {
  js: [
    {
      id: 'JSSP-JS-001',
      description: 'DbParameter.number() に文字列が渡される可能性',
      pattern: /DbParameter\.number\(\s*(?!Number\()[a-zA-Z]+\.[a-zA-Z]/g,
      message: 'DbParameter.number() の引数を Number() で変換してください（userParam の値は文字列型です）',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-002',
      description: 'var の使用',
      pattern: /\bvar\s+/g,
      message: 'var ではなく let を使用してください',
      severity: 'warning'
    },
    {
      id: 'JSSP-JS-003',
      description: '任意コード実行構文の禁止（eval / new Function）',
      pattern: /\beval\s*\(|\bnew\s+Function\s*\(/g,
      message: 'eval() / new Function() は任意コード実行の危険性があるため使用禁止です',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-004',
      description: 'SQL 文字列連結（SQLインジェクション）',
      pattern: /["'](?:SELECT|INSERT|UPDATE|DELETE|WHERE|FROM\s)[^"']*["']\s*\+/gi,
      message: 'SQL を文字列連結で構築しないでください。? プレースホルダと DbParameter を使用してください',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-005',
      description: 'new 演算子で括弧を省略している',
      pattern: /\bnew\s+[A-Z][A-Za-z0-9]*\s*;/g,
      message: 'new 演算子では括弧を省略しないでください（例: new TenantDatabase() が正しい）',
      severity: 'warning'
    },
    {
      id: 'JSSP-JS-006',
      description: '機密情報をログに出力している可能性',
      pattern: /Logger\s*\.\s*(?:info|debug|warn|error|trace)\s*\([^)]*(?:password|passwd|secret|token|apiKey|api_key|credential|accessKey|access_key)/gi,
      message: '機密情報（パスワード・トークン等）をログに出力しないでください',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-007',
      description: 'アロー関数の使用（Rhino/ES5 非対応）',
      pattern: /(?:[\w$]+|\))\s*=>/g,
      message: 'アロー関数 (=>) は Rhino (ES5) では使用できません。function キーワードを使用してください',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-008',
      description: 'Module.include() の使用（存在しない API）',
      pattern: /\bModule\.include\s*\(/g,
      message: 'Module.include() は存在しません（Module は alert/array/calendar 等のサブモジュール名前空間です）。共通JSファイルの読み込みには load() グローバル関数を使用してください',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-009',
      description: 'ES6 文字列メソッドの使用（Rhino/ES5 非対応）',
      pattern: /\.(padStart|padEnd|includes|startsWith|endsWith)\s*\(/g,
      message: 'padStart() / padEnd() / includes() / startsWith() / endsWith() は ES6 メソッドのため Rhino (ES5) では使用できません。代替実装（例: pad2 ヘルパー関数、indexOf など）を使用してください',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-010',
      description: 'ES6 配列メソッドの使用（Rhino/ES5 非対応）',
      pattern: /\.(find|findIndex|flat|flatMap|at)\s*\(/g,
      message: 'find() / findIndex() / flat() / flatMap() / at() は ES6+ メソッドのため Rhino (ES5) では使用できません。indexOf / for ループ等で代替してください',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-011',
      description: 'ES6 Object/Array 静的メソッドの使用（Rhino/ES5 非対応）',
      pattern: /\bObject\.(assign|values|entries|fromEntries)\s*\(|\bArray\.(from|of)\s*\(/g,
      message: 'Object.assign() / Object.values() / Object.entries() / Object.fromEntries() / Array.from() / Array.of() は ES6+ メソッドのため Rhino (ES5) では使用できません。for ループや手動コピー等で代替してください',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-012',
      description: 'テンプレートリテラルの使用（Rhino/ES5 非対応）',
      pattern: /`[^`]*`/g,
      message: 'テンプレートリテラル（バッククォート文字列 `...`）は Rhino (ES5) では使用できません。文字列連結（+）で代替してください',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-013',
      description: '分割代入・スプレッド演算子の使用（Rhino/ES5 非対応）',
      pattern: /(?:(?:let|const|var)\s*\[|\.\.\.[a-zA-Z_$])/g,
      message: '分割代入（[a, b] = ...）/ スプレッド演算子（...arr）は ES6 構文のため Rhino (ES5) では使用できません。インデックスアクセスや concat 等で代替してください',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-014',
      description: 'accountContext.localeId の使用（存在しないプロパティ）',
      pattern: /accountContext\.localeId\b/g,
      message: 'accountContext.localeId は存在しません。正しくは accountContext.locale です（AccountContext d.ts 参照）',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-015',
      description: 'IM-共通マスタ Manager の静的呼び出し（インスタンス化が必要）',
      pattern: /\bIMM[A-Za-z]+Manager\.[a-z]/g,
      message: 'IMMUserManager 等の IM-共通マスタ Manager はインスタンスメソッドです。new IMMUserManager() でインスタンス化してから呼び出してください（例: new IMMUserManager().getUser(...)）',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-017',
      description: 'new Identifier().getString() の誤用（存在しないメソッド）',
      pattern: /\bnew\s+Identifier\s*\(\s*\)/g,
      message: 'Identifier はインスタンス化不要です。静的メソッド Identifier.get() を使用してください（d.ts: Identifier.get(): string）',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-018',
      description: 'getUserContext().accountContext でアカウント情報にアクセスしている（存在しないプロパティ）',
      pattern: /\bgetUserContext\s*\(\s*\)\s*\.\s*accountContext\b/g,
      message: 'getUserContext().accountContext は存在しません。ログインユーザのアカウント情報（userCd / locale 等）には Contexts.getAccountContext() を使用してください（例: Contexts.getAccountContext().userCd）',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-019',
      description: 'IMMUserManager の結果に displayName でアクセスしている（存在しないプロパティ）',
      pattern: /\bgetUsers?\s*\([^)]*\)[^;]*\.displayName\b/g,
      message: 'IMMUserManager.getUser() / getUsers() の戻り値に displayName プロパティは存在しません。正しくは result.data.locales[locale].userName です',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-025',
      description: 'load() の引数に .js 拡張子が含まれている',
      pattern: /\bload\s*\(\s*['"][^'"]+\.js['"]\s*\)/g,
      message: 'load() の引数に .js 拡張子を含めないでください。intra-mart 内部で .js が自動付与されるため、"/path/file.js" と書くと "/path/file.js.js" を探しに行き FileNotFoundException になります。正しくは load("/path/to/file")（拡張子なし）',
      severity: 'error'
    },
    {
      id: 'JSSP-JS-030',
      description: 'ByteReader.read(buffer, offset, length) を直接呼び出している',
      pattern: /\.read\s*\(\s*[a-zA-Z_$][\w$]*\s*,\s*\d+\s*,\s*[\w$]+\s*\)/g,
      message: 'ByteReader.read(buffer, offset, length) は呼び出し側が容量を確保した配列を渡す Java InputStream 相当の API です。JavaScript の空配列 [] を渡すとバイトが格納されず 0 バイト保存になる落とし穴があります。バイナリ転送には reader.transferTo(writer, chunkSize) を使ってください。詳細は reference/api-binary-stream.md を参照',
      severity: 'error'
    }
  ],
  html: [
    {
      id: 'JSSP-HTML-001',
      description: '日時を単一テキストボックスで手入力させている（旧パターン）',
      pattern: /placeholder\s*=\s*["']YYYY-MM-DD HH:mm(:ss)?["']/g,
      message: '「日時」入力は imuiCalendar（日付）+ input[type=time][step=900]（時刻）の2要素に分けてください。単一テキストボックスへの手入力は廃止パターンです',
      severity: 'warning'
    },
    {
      id: 'JSSP-HTML-002',
      description: 'imart タグの value 属性がクォートで囲まれている',
      pattern: /value\s*=\s*["']\$[a-zA-Z]+["']/g,
      message: 'imart タグの value 属性はクォートで囲んではいけません（value=$data が正しい）',
      severity: 'error'
    },
    {
      id: 'JSSP-HTML-003',
      description: 'imart タグに存在しない filter 属性が使用されている',
      pattern: /<imart\s[^>]*filter\s*=/g,
      message: 'imart タグに filter 属性は存在しません。JSON 内の値を表示するには JavaScript の initializeView 等で textContent にセットしてください',
      severity: 'error'
    },
    {
      id: 'JSSP-HTML-004',
      description: 'imds-button 内でアイコンとテキストを併用しているが imds-button-text で囲んでいない',
      pattern: /<span\s+class\s*=\s*["']imds-icon[^"']*["'][^<]*<\/span>\s*[^<\s][^<]*<\/button>/g,
      message: 'アイコンとテキストを併用するボタンでは、テキストを <span class="imds-button-text"> で囲んでください',
      severity: 'error'
    },
    {
      id: 'JSSP-HTML-005',
      description: 'imds-table クラスが <table> 要素に直接指定されている',
      pattern: /<table[^>]*class\s*=\s*["'][^"']*imds-table[^"']*["']/g,
      message: 'imds-table は <table> ではなく外側の <div> に指定してください。正しい構造: <div class="imds-table"><div class="imds-table-inner"><table>',
      severity: 'error'
    },
    {
      id: 'JSSP-HTML-006',
      description: 'imds-table-cell（存在しないクラス名）',
      pattern: /class\s*=\s*["'][^"']*imds-table-cell[^"']*["']/g,
      message: 'imds-table-cell は存在しません。imds テーブルの <td> にはクラス不要です（has-text-right / has-content-only 等のオプションのみ使用可）',
      severity: 'error'
    },
    {
      id: 'JSSP-HTML-007',
      description: 'imart type="chart"（非推奨）',
      pattern: /<imart\s[^>]*type\s*=\s*["']chart["']/g,
      message: 'imart type="chart" は非推奨です。新規開発では Highcharts を使用してください',
      severity: 'warning'
    },
    {
      id: 'JSSP-HTML-008',
      description: 'imds-select クラスが <div> に付与されている',
      pattern: /<div[^>]*class\s*=\s*["'][^"']*imds-select[^"']*["']/g,
      message: 'imds-select クラスは <div> ではなく <select> 要素に直接付与してください（正: <select class="imds-select">）',
      severity: 'error'
    },
    {
      id: 'JSSP-HTML-009',
      description: 'HTML 内スクリプトで var の使用',
      pattern: /\bvar\s+/g,
      message: 'var ではなく let / const を使用してください。HTML 内スクリプトはブラウザで実行されるため let・const が使用できます',
      severity: 'warning'
    },
  ]
};

const COMMON_FUNCTION_RULES = {
  js: [
    {
      id: 'JSSP-JS-020',
      description: '$data = JSON.stringify 後にスラッシュエスケープが欠落',
      message: '$data = JSON.stringify(...).replace(/\\//g, "\\\\/") のようにスラッシュをエスケープしてください。JSON 内に </script> が含まれるとプレゼンテーションページのスクリプトが誤終了します',
      severity: 'error',
      check: function (content, lines) {
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          if (!/\$\w+\s*=\s*JSON\.stringify/.test(lines[i])) continue;
          // 同じ行 + 次 2 行以内に .replace( があるか確認
          let context = lines.slice(i, Math.min(i + 3, lines.length)).join('\n');
          if (context.indexOf('.replace(') === -1) {
            findings.push({ line: i });
          }
        }
        return findings;
      }
    },
    {
      id: 'JSSP-JS-021',
      description: 'DB TIMESTAMP カラムを formatTimestamp() でラップしていない',
      message: 'DBの TIMESTAMP カラム（_at 等）を JSON に含める場合は formatTimestamp() でラップしてください。JDBCドライバによっては Date オブジェクトとして返るため String() 変換が "Tue Apr 21 2026 10:" 形式になります（post-generation-verification.md 3-4 参照）',
      severity: 'warning',
      check: function (content, lines) {
        let findings = [];
        let tsColPattern = /\brow\.(\w+_at)\b/;
        let objectPropPattern = /^\s*\w+\s*:/;
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (!tsColPattern.test(line)) continue;
          if (!objectPropPattern.test(line)) continue;
          if (line.indexOf('formatTimestamp') !== -1) continue;
          findings.push({ line: i });
        }
        return findings;
      }
    },
    {
      id: 'JSSP-JS-022',
      description: 'executeByTemplate のパラメータに生の null を渡している可能性',
      message: "executeByTemplate のパラメータオブジェクトの値に生の null を渡すと「The parameter must be instance of DbParameter」ランタイムエラーになります。型に応じた対処が必要です:\n  - VARCHAR / 数値列: DbParameter.string(value) / DbParameter.number(value) を直接呼ぶ（null 引数は動作確認済み。三項演算子は不要）\n  - DATE 列: value ? DbParameter.date(new Date(value)) : new DbParameter(null, DbParameter.TYPE_DATE)\n  - TIMESTAMP 列: value ? DbParameter.timestamp(new Date(value)) : new DbParameter(null, DbParameter.TYPE_TIMESTAMP)\n  - /*IF param != null*/ で囲まれた条件パラメータのみ null を渡してよい（2WaySQL がキーの省略として扱う）",
      severity: 'warning',
      check: function(content, lines) {
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          // `? DbParameter.xxx(...) : null` パターンを検出
          if (/\?\s*DbParameter\s*\.\w+\s*\([^)]*\)\s*:\s*null\b/.test(line)) {
            findings.push({ line: i });
          }
        }
        return findings;
      }
    },
    {
      id: 'JSSP-JS-028',
      description: 'DATE/TIMESTAMP 列に DbParameter.string() を使っている可能性',
      message: "DATE/TIMESTAMP カラムのバインドに DbParameter.string() を使うと PostgreSQL で「列は型 date ですが、式は型 character varying でした」エラーになります。DbParameter.date(new Date(value)) / DbParameter.timestamp(new Date(value)) を使用してください。NULL を渡す場合は new DbParameter(null, DbParameter.TYPE_DATE) / new DbParameter(null, DbParameter.TYPE_TIMESTAMP) を使用してください（DbParameter.NULL はストアドプロシージャ専用の定数であり DbParameter インスタンスではありません）",
      severity: 'warning',
      check: function(content, lines) {
        let findings = [];
        // 日付を示す変数名に DbParameter.string() を使っているパターンを検出
        let dateVarPattern = /DbParameter\.string\s*\(\s*[^)]*\b(\w*[Dd]ate\w*|\w*[Ee]nd[Aa]t\w*|\w*[Ss]tart[Aa]t\w*|\w*[Pp]eriod(?:Start|End|At|Date|From|To)\w*)\b/;
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
          if (dateVarPattern.test(line)) {
            findings.push({ line: i });
          }
        }
        return findings;
      }
    },
    {
      id: 'JSSP-JS-016',
      description: 'new Date(変数) による文字列→Date変換（Rhino で不安定）',
      message: 'Rhino では new Date("YYYY-MM-DD HH:mm:ss") / new Date("YYYY-MM-DDTHH:mm:ss") のパースが不安定で Invalid Date になる場合があります。"YYYY-MM-DD HH:mm:ss" 形式の文字列を受け取る場合は parseLocalDateTime() ヘルパー（多引数コンストラクタ方式）を使用してください',
      severity: 'warning',
      check: function(content, lines) {
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
          if (!/\bnew Date\(\s*[a-zA-Z_$]/.test(line)) continue;
          // new Date( の開き括弧の位置から内側を解析して多引数か判定
          let pos = line.indexOf('new Date(');
          if (pos === -1) continue;
          let parenStart = pos + 'new Date('.length - 1;
          let depth = 0;
          let hasComma = false;
          for (let c = parenStart; c < line.length; c++) {
            let ch = line[c];
            if (ch === '(' || ch === '[') depth++;
            else if (ch === ')' || ch === ']') {
              depth--;
              if (depth === 0) break;
            } else if (ch === ',' && depth === 1) {
              hasComma = true;
              break;
            }
          }
          // 多引数コンストラクタ（year, month, day 形式）はスキップ
          if (!hasComma) {
            findings.push({ line: i });
          }
        }
        return findings;
      }
    },
    {
      id: 'JSSP-JS-029',
      description: 'DbParameter.date(null) / DbParameter.timestamp(null) を使っている',
      message: "DbParameter.date(null) / DbParameter.timestamp(null) は Java 内部で NullPointerException が発生します。DATE/TIMESTAMP カラムに NULL を挿入する場合は new DbParameter(null, DbParameter.TYPE_DATE) / new DbParameter(null, DbParameter.TYPE_TIMESTAMP) を使用してください。なお DbParameter.string(null) / DbParameter.number(null) は動作します（引数がプリミティブ型のため）",
      severity: 'error',
      check: function(content, lines) {
        let findings = [];
        let pattern = /DbParameter\.(date|timestamp)\s*\(\s*null\s*\)/;
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
          if (pattern.test(line)) {
            findings.push({ line: i });
          }
        }
        return findings;
      }
    },
    {
      id: 'JSSP-JS-023',
      description: 'db.select() / db.execute() のパラメータが DbParameter でラップされていない',
      message: 'db.select() / db.execute() の配列パラメータは DbParameter.string() / DbParameter.number() 等でラップしてください',
      severity: 'error',
      check: function (content, lines) {
        let findings = [];
        let callPattern = /\bdb\.(select|execute)\s*\(/;
        for (let i = 0; i < lines.length; i++) {
          if (!callPattern.test(lines[i])) continue;
          let combined = '';
          for (let j = i; j < Math.min(i + 5, lines.length); j++) {
            combined += lines[j] + '\n';
            if (lines[j].indexOf(']') !== -1 || (j > i && lines[j].indexOf(';') !== -1)) break;
          }
          let dbCallMatch = combined.match(/\bdb\.(select|execute)\s*\([^,]+,\s*\[\s*([\s\S]*?)\s*\]/);
          if (!dbCallMatch) continue;
          let arrayContent = dbCallMatch[2].trim();
          if (!arrayContent) continue;
          let elements = [];
          let depth = 0;
          let current = '';
          for (let c = 0; c < arrayContent.length; c++) {
            let ch = arrayContent[c];
            if (ch === '(' || ch === '[') depth++;
            else if (ch === ')' || ch === ']') depth--;
            else if (ch === ',' && depth === 0) {
              elements.push(current.trim());
              current = '';
              continue;
            }
            current += ch;
          }
          if (current.trim()) elements.push(current.trim());
          let hasBareParam = false;
          for (let el of elements) {
            if (el && !el.startsWith('DbParameter.')) {
              hasBareParam = true;
              break;
            }
          }
          if (hasBareParam) {
            findings.push({ line: i });
          }
        }
        return findings;
      }
    },
    {
      id: 'JSSP-JS-026',
      description: 'Transaction.begin() の戻り値を isSuccess() でチェックしていない',
      message: 'Transaction.begin(callback) は例外を再スローせず DatabaseResult を返します。戻り値を変数で受けて txResult.isSuccess() で失敗判定してください。業務例外はコールバック内で try-catch で外側の変数にキャプチャし、トランザクション後に再スローするパターンを使用してください（post-generation-verification.md 3-7 参照）',
      severity: 'error',
      check: function(content, lines) {
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          // コメント行はスキップ
          if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
          if (!/\bTransaction\.begin\s*\(/.test(line)) continue;
          // 同じ行で戻り値を変数に代入しているか（let x = / const x = / var x = / 既存変数 = ）
          let hasAssignment = /(?:\b(?:let|const|var)\s+\w+|\b\w+)\s*=\s*Transaction\.begin\s*\(/.test(line);
          if (!hasAssignment) {
            findings.push({ line: i });
          }
        }
        return findings;
      }
    },
    {
      id: 'JSSP-JS-027',
      description: 'TIMESTAMP/DATE カラム比較のバインドに DbParameter.string を使っている可能性',
      message: 'TIMESTAMP/DATE カラムと比較するバインドパラメータには DbParameter.timestamp(Date) / DbParameter.date(Date) を使用してください。DbParameter.string() を渡すと PostgreSQL で「演算子が存在しません: timestamp without time zone >= character varying」エラーになります（Oracle/SQLServer では暗黙変換されるため見逃されやすい）。文字列は parseLocalDateTime() で Date に変換してから渡します（post-generation-verification.md 3-9 参照）',
      severity: 'warning',
      check: function(content, lines) {
        let findings = [];
        // startAt / endAt / rangeFrom / rangeTo / startDate / endDate / createdAt / updatedAt 等
        // 明らかに日時を表す変数名・プロパティ名に DbParameter.string を使っている行を検出
        let suspiciousPattern = /DbParameter\.string\s*\(\s*[^)]*\b(startAt|endAt|rangeFrom|rangeTo|startDate|endDate|createdAt|updatedAt|targetDate|fromDate|toDate|targetAt|fromAt|toAt)\b/;
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
          // 文字列化サフィックス（〜AtStr 等）は対象外にする
          if (/\b(startAtStr|endAtStr)\b/.test(line)) continue;
          if (suspiciousPattern.test(line)) {
            findings.push({ line: i });
          }
        }
        return findings;
      }
    },
    {
      id: 'JSSP-JS-024',
      description: '共通モジュールの読み込みに include() を使っている',
      message: '共通モジュール（common 配下の .js）の読み込みは load() を使用してください。include() は呼び出し先を独立スコープで実行し init() を呼び出すため、呼び出し先で宣言された定数・関数は呼び出し元から参照できません。正しくは load("xxx/common/yyy") を使用します',
      severity: 'error',
      check: function (content, lines) {
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          // コメント行はスキップ
          if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
          // include("...common...") または include('...common...') を検出
          let match = line.match(/\binclude\s*\(\s*["']([^"']*\/common\/[^"']*|common\/[^"']*)["']/);
          if (match) {
            findings.push({
              line: i,
              overrideMessage: '共通モジュール "' + match[1] + '" の読み込みに include() を使用しています。load() に置き換えてください'
            });
          }
        }
        return findings;
      }
    }
  ],
  html: [
    {
      id: 'JSSP-HTML-010',
      description: 'imds-selectbox タイポ（HTML class 属性・CSS セレクタ）',
      message: 'imds-selectbox は存在しません。正しくは imds-select です',
      severity: 'error',
      check: function (content, lines) {
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (/class\s*=\s*["'][^"']*imds-selectbox[^"']*["']/.test(line)) {
            findings.push({ line: i, overrideMessage: 'class に imds-selectbox が指定されています。正しくは imds-select です' });
          } else if (/\.imds-selectbox\s*\{/.test(line)) {
            findings.push({ line: i, overrideMessage: 'CSS で .imds-selectbox を参照しています。正しくは .imds-select です' });
          }
        }
        return findings;
      }
    },
    {
      id: 'JSSP-HTML-011',
      description: 'imuiCalendar の設定誤り（altField・floatable・hidden 参照・セレクタ形式）',
      message: 'imuiCalendar の設定に問題があります',
      severity: 'error',
      check: function (content, lines) {
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (!/type\s*=\s*["']imuiCalendar["']/.test(line)) continue;

          // floatable="true" が未指定
          if (!/floatable\s*=\s*["']true["']/.test(line)) {
            findings.push({
              line: i,
              overrideMessage: 'imuiCalendar には floatable="true" を指定してください。未指定だとインライン表示（画面埋め込み）になり、テキストボックス＋カレンダーアイコンの標準UIになりません'
            });
          }

          // altField が未指定
          if (!/\baltField\b/.test(line)) {
            findings.push({
              line: i,
              overrideMessage: 'imuiCalendar には altField で表示用テキストボックスの CSS セレクタを指定してください（例: altField="#\\\\:fieldName\\\\:"）。altField がないとカレンダーアイコンが表示されません。field 属性は hidden input 用途であり代用できません'
            });
          } else {
            // altField が指定されている場合のみセレクタ形式チェック（# 始まりでなければ NG）
            let altFieldMatch = line.match(/altField\s*=\s*["']([^"']+)["']/);
            if (altFieldMatch && altFieldMatch[1].charAt(0) !== '#') {
              findings.push({
                line: i,
                overrideMessage: 'imuiCalendar の altField は CSS セレクタ形式で指定してください（正: altField="#\\\\:fieldId\\\\:"）。要素 ID のみ（":fieldId:"）では altField が動作しません'
              });
            }
          }

          // 隣接行に hidden input がないか（直前・直後それぞれ1行）
          let prevLine = i > 0 ? lines[i - 1] : '';
          let nextLine = i < lines.length - 1 ? lines[i + 1] : '';
          if (/<input\s[^>]*type\s*=\s*["']hidden["']/.test(prevLine) ||
              /<input\s[^>]*type\s*=\s*["']hidden["']/.test(nextLine)) {
            findings.push({
              line: i,
              overrideMessage: 'imuiCalendar の隣に hidden input があります。altField は <input type="text"> を指定してください。hidden input だとカレンダーアイコンが表示されません'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'JSSP-HTML-012',
      description: 'DOMContentLoaded を使用せず DOM に直接アクセスしている',
      message: 'プレゼンテーションページでは document.addEventListener("DOMContentLoaded", () => { ... }) 内で DOM 操作を行ってください。ページロード前にアクセスすると要素が取得できずエラーになります',
      severity: 'warning',
      check: function (content, lines) {
        let hasDomAccess = /document\.(getElementById|querySelector|querySelectorAll)\s*\(/.test(content);
        if (!hasDomAccess) return [];
        let hasDomContentLoaded = /DOMContentLoaded/.test(content);
        if (hasDomContentLoaded) return [];
        // 最初の DOM アクセス行を報告
        for (let i = 0; i < lines.length; i++) {
          if (/document\.(getElementById|querySelector|querySelectorAll)\s*\(/.test(lines[i])) {
            return [{ line: i }];
          }
        }
        return [];
      }
    },
    {
      id: 'JSSP-HTML-013',
      description: 'Enter キーイベントで isComposing チェックが漏れている',
      message: 'Enter キーイベントには !event.isComposing の条件を加えてください。日本語 IME 変換中の確定 Enter で処理が誤発火します',
      severity: 'error',
      check: function (content, lines) {
        let findings = [];
        let enterPattern = /\.key\s*===\s*["']Enter["']/;
        for (let i = 0; i < lines.length; i++) {
          if (!enterPattern.test(lines[i])) continue;
          // 前後5行以内に isComposing が含まれているか確認
          let start = Math.max(0, i - 5);
          let end = Math.min(lines.length - 1, i + 5);
          let context = lines.slice(start, end + 1).join('\n');
          if (context.indexOf('isComposing') === -1) {
            findings.push({ line: i });
          }
        }
        return findings;
      }
    },
    {
      id: 'JSSP-HTML-014',
      description: 'ホワイトリスト外の imart type 値',
      message: '未定義の imart type が使用されています（使用可否を要確認）。使用可能な type: head, string, imSecureToken, imuiCalendar, message, workflowOpenPage, workflowOpenPageCsjs, imACMSearch, hidden, tag',
      severity: 'error',
      check: function (content, lines) {
        let findings = [];
        let WHITELIST = [
          'head', 'string', 'imSecureToken', 'imuiCalendar', 'message',
          'workflowOpenPage', 'workflowOpenPageCsjs', 'imACMSearch', 'hidden', 'tag',
          'chart'  // chart は JSSP-HTML-007 で別途 warning 報告するためここではスキップ
        ];
        let typePattern = /<imart\s[^>]*type\s*=\s*["']([^"']+)["']/g;
        for (let i = 0; i < lines.length; i++) {
          let match;
          let linePattern = /<imart\s[^>]*type\s*=\s*["']([^"']+)["']/g;
          while ((match = linePattern.exec(lines[i])) !== null) {
            let typeVal = match[1];
            if (WHITELIST.indexOf(typeVal) === -1) {
              findings.push({ line: i, typeVal: typeVal });
            }
          }
        }
        return findings.map(function (f) {
          return {
            line: f.line,
            overrideMessage: '未定義の imart type="' + f.typeVal + '" が使用されています（使用可否を要確認）。使用可能な type: head, string, imSecureToken, imuiCalendar, message, workflowOpenPage, workflowOpenPageCsjs, imACMSearch, hidden, tag'
          };
        });
      }
    },
    {
      id: 'JSSP-HTML-015',
      description: 'imdsConfirm を呼び出しているが関数定義がない',
      message: 'imdsConfirm はプラットフォームのグローバル関数として提供されていません。各ページに function imdsConfirm(...) のインライン定義が必要です',
      severity: 'error',
      check: function(content, lines) {
        if (!/\bimdsConfirm\s*\(/.test(content)) return [];
        if (/function\s+imdsConfirm\s*\(/.test(content)) return [];
        for (let i = 0; i < lines.length; i++) {
          if (/\bimdsConfirm\s*\(/.test(lines[i])) {
            return [{ line: i }];
          }
        }
        return [];
      }
    },
    {
      id: 'JSSP-HTML-017',
      description: 'imACMSearch コールバック（グローバル）から DOMContentLoaded スコープ関数を呼ぶための window._ ブリッジが未設定',
      message: 'imACMSearch のコールバック関数はグローバルスコープに配置が必要ですが、DOMContentLoaded 内の関数は直接参照できません（ReferenceError になります）。DOMContentLoaded 内で window._functionName = functionName として公開し、コールバックから window._functionName() で呼び出してください（post-generation-verification.md 4-3 参照）',
      severity: 'error',
      check: function(content, lines) {
        if (!/imACMSearch/.test(content)) return [];
        if (!/DOMContentLoaded/.test(content)) return [];
        // グローバルスコープに window.xxx = xxx（コールバック登録）がある
        if (!/\bwindow\.[a-zA-Z][a-zA-Z0-9_]*\s*=\s*[a-zA-Z_$]/.test(content)) return [];
        // window._ ブリッジが存在する → OK
        if (/\bwindow\._[a-zA-Z]/.test(content)) return [];
        // ブリッジなしでコールバックを登録している行を報告
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          if (/\bwindow\.[a-zA-Z][a-zA-Z0-9_]*\s*=\s*[a-zA-Z_$]/.test(lines[i]) &&
              !/\bwindow\._/.test(lines[i])) {
            findings.push({ line: i });
            break;
          }
        }
        return findings;
      }
    },
    {
      id: 'JSSP-HTML-018',
      description: '条件付き必須フィールドの必須マーク動的制御の整合性チェック',
      message: '条件付き必須フィールドの必須マーク（imds-required-label-required）を動的に制御してください',
      severity: 'warning',
      check: function (content, lines) {
        if (!/imds-required-label-required/.test(content)) return [];

        let findings = [];

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (!/imds-required-label-required/.test(line)) continue;

          // span タグの属性部分を抽出
          let spanMatch = line.match(/<span([^>]*)>/);
          if (!spanMatch) continue;
          let attrs = spanMatch[1];

          // id あり → toggleRequiredMark(labelId, ...) が呼ばれているか確認
          let idMatch = attrs.match(/\bid\s*=\s*["']([^"']+)["']/);
          if (idMatch) {
            let labelId = idMatch[1];

            // 命名規約: コロンで囲まれた id（例: `:fieldName:-label`）は
            // accessibility 用（aria-labelledby の参照対象）であり、常時必須の意味を持つ。
            // この形式の場合は動的制御不要なので toggleRequiredMark チェックの対象外とする。
            // 詳細は rules/jssp-presentation-page.md「id 属性の命名規約」を参照。
            if (/^:.+:-label$/.test(labelId)) {
              continue;
            }

            let escapedId = labelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            let togglePattern = new RegExp('toggleRequiredMark\\s*\\(\\s*["\']' + escapedId + '["\']');
            if (!togglePattern.test(content)) {
              findings.push({
                line: i,
                overrideMessage: 'ラベルスパン id="' + labelId + '" に対応する toggleRequiredMark("' + labelId + '", ...) の呼び出しが見当たりません。条件付き必須の場合は JS 側で動的制御してください'
              });
            }
            continue;
          }

          // id なし → 最近の祖先 div が初期 hidden セクションか確認（最大 30 行遡る）
          let inHiddenSection = false;
          for (let j = i - 1; j >= Math.max(0, i - 30); j--) {
            let divMatch = lines[j].match(/<div([^>]*)>/);
            if (!divMatch) continue;
            let divAttrs = divMatch[1];
            // id が "xxx-section" 形式（セクション区切り div）なら判定して打ち切り
            if (/\bid\s*=\s*["'][^"']*["']/.test(divAttrs)) {
              inHiddenSection = /\bclass\s*=\s*["'][^"']*\bhidden\b[^"']*["']/.test(divAttrs);
              break;
            }
          }

          if (inHiddenSection) {
            findings.push({
              line: i,
              overrideMessage: '初期非表示セクション内で imds-required-label-required が静的にセットされています。条件付き必須フィールドのラベルには id を付与し、toggleRequiredMark(id, condition) で動的制御してください'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'JSSP-HTML-016',
      description: '同一サーバへの POST フォームに CSRF トークン（imSecureToken）がない',
      message: '同一サーバへの POST フォームには <imart type="imSecureToken"> を配置してください（CSRF 対策）',
      severity: 'error',
      check: function (content, lines) {
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          if (!/<form\b/i.test(lines[i])) continue;
          // form タグが複数行にまたがる場合を考慮して最大5行を結合
          let formChunk = lines.slice(i, Math.min(i + 5, lines.length)).join(' ');
          let formTagMatch = formChunk.match(/<form\b[^>]*>/i);
          if (!formTagMatch) continue;
          let formTagStr = formTagMatch[0];
          // method="post" でなければスキップ
          if (!/method\s*=\s*["']post["']/i.test(formTagStr)) continue;
          // action 属性が外部 URL（http:// / https://）の場合はスキップ
          let actionMatch = formTagStr.match(/action\s*=\s*["']([^"']+)["']/i);
          if (actionMatch && /^https?:\/\//i.test(actionMatch[1])) continue;
          // ファイル内に imSecureToken が存在しない場合に報告
          if (!/type\s*=\s*["']imSecureToken["']/.test(content)) {
            findings.push({ line: i });
          }
        }
        return findings;
      }
    }
  ]
};

const COMMON_SQL_FUNCTION_RULES = [
  {
    id: 'JSSP-SQL-001',
    description: '/*BEGIN*/ブロック内に /*IF*/外の固定条件が含まれている',
    message: "/*BEGIN*/は WHERE 句の全条件が /*IF*/〜/*END*/ に囲まれている場合のみ使用します。固定条件（status = '1' 等）がある場合は /*BEGIN*/ を除去し WHERE を直書きしてください",
    severity: 'error',
    check: function(content, lines) {
      let findings = [];
      // depth: 0=BEGIN外, 1=BEGIN直下（IF外）, 2+=IFブロック内
      let depth = 0;
      let beginLine = -1;
      let fixedInBegin = false;

      for (let i = 0; i < lines.length; i++) {
        let trimmed = lines[i].trim();

        if (/\/\*BEGIN\*\//.test(trimmed)) {
          if (depth === 0) {
            depth = 1;
            beginLine = i;
            fixedInBegin = false;
          } else {
            depth++;
          }
          continue;
        }

        if (depth === 0) continue;

        if (/\/\*IF\b/.test(trimmed)) {
          depth++;
          continue;
        }

        if (/\/\*END\*\//.test(trimmed)) {
          depth--;
          if (depth === 0 && fixedInBegin) {
            findings.push({ line: beginLine });
          }
          continue;
        }

        // BEGIN直下（IFブロック外）で実際の条件を含む行（WHERE/AND/OR 単独行は除外）
        if (depth === 1 && trimmed && !trimmed.startsWith('--') && !/^\/\*/.test(trimmed)) {
          // 条件演算子を含む場合のみ固定条件とみなす
          let isKeywordOnly = /^(WHERE|AND|OR|ORDER\s+BY|GROUP\s+BY|HAVING|ON)\s*$/i.test(trimmed);
          let hasConditionOp = /[=<>!]|(\bLIKE\b|\bIN\b|\bBETWEEN\b|\bIS\b|\bNOT\b)/i.test(trimmed);
          if (!isKeywordOnly && hasConditionOp) {
            fixedInBegin = true;
          }
        }
      }

      return findings;
    }
  }
];

// ========================================
// ユーティリティ関数
// ========================================
function collectFiles(targetPath) {
  let files = [];
  let stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    files.push(targetPath);
  } else if (stat.isDirectory()) {
    let entries = fs.readdirSync(targetPath, { recursive: true });
    for (let entry of entries) {
      let fullPath = path.join(targetPath, entry);
      if (fs.statSync(fullPath).isFile()) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

/**
 * ルールセットをマージする（拡張ルールを共通ルールに追加）
 */
function mergeRules(base, extra) {
  let merged = {};
  for (let ext of Object.keys(base)) {
    merged[ext] = (base[ext] || []).concat(extra[ext] || []);
  }
  for (let ext of Object.keys(extra)) {
    if (!merged[ext]) {
      merged[ext] = extra[ext] || [];
    }
  }
  return merged;
}

function validateFile(filePath, patternRules, functionRules) {
  let ext = path.extname(filePath).replace('.', '');
  let rules = patternRules[ext];
  let funcRules = functionRules ? functionRules[ext] : undefined;

  // .sql ファイルは COMMON_SQL_FUNCTION_RULES を適用
  let sqlFuncRules = (ext === 'sql') ? COMMON_SQL_FUNCTION_RULES : [];

  if (!rules && !funcRules && sqlFuncRules.length === 0) return [];

  let content = fs.readFileSync(filePath, 'utf-8');
  let lines = content.split('\n');
  let findings = [];

  if (rules) {
    for (let rule of rules) {
      let matches = content.match(rule.pattern);
      if (matches) {
        for (let i = 0; i < lines.length; i++) {
          let linePattern = new RegExp(rule.pattern.source, rule.pattern.flags.replace('g', ''));
          if (linePattern.test(lines[i])) {
            findings.push({
              file: filePath,
              line: i + 1,
              ruleId: rule.id,
              severity: rule.severity,
              message: rule.message,
              matchedText: lines[i].trim().substring(0, 80)
            });
          }
        }
      }
    }
  }

  if (funcRules) {
    for (let rule of funcRules) {
      let hits = rule.check(content, lines, filePath);
      for (let hit of hits) {
        findings.push({
          file: filePath,
          line: hit.line + 1,
          ruleId: rule.id,
          severity: rule.severity,
          message: hit.overrideMessage || rule.message,
          matchedText: lines[hit.line].trim().substring(0, 80)
        });
      }
    }
  }

  // .sql ファイルの関数ルール
  for (let rule of sqlFuncRules) {
    let hits = rule.check(content, lines, filePath);
    for (let hit of hits) {
      findings.push({
        file: filePath,
        line: hit.line + 1,
        ruleId: rule.id,
        severity: rule.severity,
        message: hit.overrideMessage || rule.message,
        matchedText: lines[hit.line].trim().substring(0, 80)
      });
    }
  }

  return findings;
}

/**
 * 業務テーブルへの更新操作があるのに DDL ファイルが存在しないケースを検出する。
 * ディレクトリ指定時のみ実行（単一ファイル指定時はスキップ）。
 */
function checkDdlExists(targetPath, jsFiles) {
  let findings = [];
  let stat = fs.statSync(targetPath);
  if (!stat.isDirectory()) return findings;

  // .js ファイル内に db.insert / db.update / db.remove（業務テーブル操作）があるか
  let hasTableOps = false;
  let firstOpFile = '';
  let firstOpLine = 0;
  for (let file of jsFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (/\bdb\.(insert|update|remove)\s*\(/.test(lines[i])) {
        hasTableOps = true;
        firstOpFile = file;
        firstOpLine = i;
        break;
      }
    }
    if (hasTableOps) break;
  }

  if (!hasTableOps) return findings;

  // src/main/storage/system/products/import/basic/<機能名>/<version>/ に .sql ファイルが存在するか
  // <version> ディレクトリは任意の文字列（1.0.0 等）。再帰的に .sql を探索する
  let featureMatch = targetPath.match(/src[\\\/]main[\\\/]jssp[\\\/]src[\\\/]([^\\\/]+)/);
  let featureName = featureMatch ? featureMatch[1] : null;
  let projectRoot = targetPath.replace(/src[\\\/]main[\\\/]jssp[\\\/]src[\\\/].*/, '');
  let schemaDir = featureName
    ? path.resolve(projectRoot, 'src/main/storage/system/products/import/basic/' + featureName)
    : null;
  let hasDdl = false;
  if (schemaDir && fs.existsSync(schemaDir)) {
    hasDdl = (function walk(dir) {
      let entries = fs.readdirSync(dir, { withFileTypes: true });
      for (let entry of entries) {
        let p = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (walk(p)) return true;
        } else if (entry.name.endsWith('.sql')) {
          return true;
        }
      }
      return false;
    })(schemaDir);
  }

  if (!hasDdl) {
    findings.push({
      file: firstOpFile,
      line: firstOpLine + 1,
      ruleId: 'JSSP-DDL-001',
      severity: 'warning',
      message: '業務テーブルへの INSERT/UPDATE/DELETE がありますが、src/main/storage/system/products/import/basic/<機能名>/<version>/ に DDL ファイルが見つかりません。CREATE TABLE 文とサンプルデータの INSERT 文を出力してください',
      matchedText: fs.readFileSync(firstOpFile, 'utf-8').split('\n')[firstOpLine].trim().substring(0, 80)
    });
  }

  return findings;
}

function runValidation(targetPath, patternRules, functionRules) {
  let files = collectFiles(targetPath);
  let jsHtmlFiles = files.filter(f => /\.(js|html|sql)$/.test(f));

  if (jsHtmlFiles.length === 0) {
    console.log('No .js/.html files found in ' + targetPath);
    return { errors: 0, warnings: 0, fileCount: 0 };
  }

  let allFindings = [];
  for (let file of jsHtmlFiles) {
    allFindings.push(...validateFile(file, patternRules, functionRules));
  }

  // DDL 存在チェック（ディレクトリ指定時のみ）
  let jsFiles = jsHtmlFiles.filter(f => f.endsWith('.js'));
  allFindings.push(...checkDdlExists(targetPath, jsFiles));

  let errors = allFindings.filter(f => f.severity === 'error');
  let warnings = allFindings.filter(f => f.severity === 'warning');

  if (allFindings.length === 0) {
    console.log('PASS: ' + jsHtmlFiles.length + ' file(s) checked, 0 issue(s)');
  } else {
    for (let finding of allFindings) {
      let icon = finding.severity === 'error' ? 'ERROR' : 'WARN ';
      console.log(icon + ' [' + finding.ruleId + '] ' + finding.file + ':' + finding.line);
      console.log('       ' + finding.message);
      console.log('       > ' + finding.matchedText);
      console.log();
    }
    console.log('Result: ' + errors.length + ' error(s), ' + warnings.length + ' warning(s) in ' + jsHtmlFiles.length + ' file(s)');
  }

  return { errors: errors.length, warnings: warnings.length, fileCount: jsHtmlFiles.length };
}

// ========================================
// CLI 実行（直接実行された場合のみ）
// ========================================
if (require.main === module) {
  let targetPath = process.argv[2];
  if (!targetPath) {
    console.error('Usage: node validate-jssp-code.js <directory-or-file>');
    process.exit(2);
  }
  if (!fs.existsSync(targetPath)) {
    console.error('Path not found: ' + targetPath);
    process.exit(2);
  }

  let result = runValidation(targetPath, COMMON_RULES, COMMON_FUNCTION_RULES);
  process.exit(result.errors > 0 ? 1 : 0);
}

// ========================================
// モジュールエクスポート（他スクリプトからの利用用）
// ========================================
module.exports = {
  COMMON_RULES,
  COMMON_FUNCTION_RULES,
  COMMON_SQL_FUNCTION_RULES,
  collectFiles,
  mergeRules,
  validateFile,
  checkDdlExists,
  runValidation
};
