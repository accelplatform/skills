#!/usr/bin/env node
/*
 * fetch-logic-swagger.js — IM-LogicDesigner ルーティング定義 swagger spec 取得・抽出ツール
 *
 * 使い方:
 *   node fetch-logic-swagger.js [--base-url <url>] [--route <keyword>] [--list]
 *
 *   --base-url <url> : intra-mart のベースURL（既定: http://127.0.0.1/imart）
 *   --route <keyword> : route パスまたは tags に対する部分一致キーワード。
 *                        指定時は、一致した path について定義済みモデル（definitions）を
 *                        再帰的に解決（$ref を展開）した上で出力する。
 *   --list            : --route を指定せず全 path の一覧（path, method, summary, tags, operationId）のみ出力する。
 *
 * 依存: Node.js 標準ライブラリのみ（npm install 不要）。Node 18+ の組み込み fetch を使用。
 *
 * 終了コード:
 *   0 : 正常終了
 *   1 : 取得失敗（401含む）・引数不正
 */

const DEFAULT_BASE_URL = 'http://127.0.0.1/imart';

const PERMISSION_MESSAGE =
  '認可設定画面の「画面・処理」で「IM-LogicDesigner」-「Swagger specification」に「ゲストユーザ」を許可してください';

function parseArgs(argv) {
  const opts = { baseUrl: DEFAULT_BASE_URL, route: null, list: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--base-url') {
      opts.baseUrl = argv[++i];
    } else if (arg === '--route') {
      opts.route = argv[++i];
    } else if (arg === '--list') {
      opts.list = true;
    } else if (arg === '--help' || arg === '-h') {
      opts.help = true;
    }
  }
  return opts;
}

function printHelp() {
  console.error(
    [
      'Usage: node fetch-logic-swagger.js [--base-url <url>] [--route <keyword>] [--list]',
      '',
      '  --base-url <url>   intra-mart base URL (default: http://127.0.0.1/imart)',
      '  --route <keyword>  substring match against route path / tags. Resolves $ref definitions for matches.',
      '  --list             print only {path, method, summary, tags, operationId} for all routes.',
    ].join('\n')
  );
}

// $ref ("#/definitions/Xxx") を再帰的に解決してインライン展開する。循環参照はそのまま $ref 文字列を残す。
function resolveRefs(node, definitions, seen) {
  if (Array.isArray(node)) {
    return node.map((item) => resolveRefs(item, definitions, seen));
  }
  if (node && typeof node === 'object') {
    if (typeof node.$ref === 'string' && node.$ref.startsWith('#/definitions/')) {
      const name = node.$ref.slice('#/definitions/'.length);
      if (seen.has(name)) {
        return { $ref: node.$ref, note: 'circular reference, not expanded' };
      }
      const target = definitions[name];
      if (!target) {
        return { $ref: node.$ref, note: 'definition not found' };
      }
      const nextSeen = new Set(seen);
      nextSeen.add(name);
      return resolveRefs(target, definitions, nextSeen);
    }
    const out = {};
    for (const key of Object.keys(node)) {
      out[key] = resolveRefs(node[key], definitions, seen);
    }
    return out;
  }
  return node;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    return 0;
  }

  const url = `${opts.baseUrl.replace(/\/$/, '')}/logic/all-api-docs`;
  let response;
  try {
    response = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (e) {
    console.error(`fetch failed: ${url}`);
    console.error(String(e));
    return 1;
  }

  if (response.status === 401 || response.status === 403) {
    console.error(`HTTP ${response.status}: swagger spec の取得に権限がありません。`);
    console.error('');
    console.error(PERMISSION_MESSAGE);
    return 1;
  }

  if (!response.ok) {
    console.error(`HTTP ${response.status}: ${url} の取得に失敗しました。`);
    const body = await response.text().catch(() => '');
    if (body) console.error(body.slice(0, 500));
    return 1;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    console.error(`想定外の Content-Type です（${contentType}）。テナントログインへのリダイレクト等の可能性があります。`);
    return 1;
  }

  const spec = await response.json();
  const paths = spec.paths || {};
  const definitions = spec.definitions || {};

  if (!opts.route) {
    const rows = [];
    for (const [routePath, methods] of Object.entries(paths)) {
      for (const [method, op] of Object.entries(methods)) {
        rows.push({
          path: routePath,
          method: method.toUpperCase(),
          summary: op.summary || '',
          tags: op.tags || [],
          operationId: op.operationId || '',
        });
      }
    }
    console.log(JSON.stringify(rows, null, 2));
    return 0;
  }

  const keyword = opts.route.toLowerCase();
  const matched = {};
  for (const [routePath, methods] of Object.entries(paths)) {
    for (const [method, op] of Object.entries(methods)) {
      const tags = op.tags || [];
      const hit =
        routePath.toLowerCase().includes(keyword) ||
        tags.some((t) => t.toLowerCase().includes(keyword)) ||
        (op.operationId || '').toLowerCase().includes(keyword);
      if (hit) {
        matched[routePath] = matched[routePath] || {};
        matched[routePath][method] = resolveRefs(op, definitions, new Set());
      }
    }
  }

  if (Object.keys(matched).length === 0) {
    console.error(`キーワード "${opts.route}" に一致する route が見つかりませんでした。`);
    console.error('--list で全 route 一覧を確認してください。');
    return 1;
  }

  console.log(JSON.stringify({ basePath: spec.basePath, paths: matched }, null, 2));
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
