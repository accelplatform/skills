---
name: smartlime-assistant
description: smartlime の useAssistant で、intra-mart Accel Platform（iAP）の IM-Copilot のアシスタントと会話する機能を作る。IM-Copilot が導入されているかの実行時の確認、メッセージの送信と応答の逐次受信（差分の連結）、会話（スレッド）と履歴、画像の添付、中断できないことへの対処、エラーの扱い、アプリのデザインに合わせたチャット画面の作り方とテストを扱う。「IM-Copilot」「アシスタント」「AI チャット」「useAssistant」と言及されたときに使用。
---

# IM-Copilot のアシスタントとの会話（useAssistant）

## 目的

iAP の IM-Copilot に設定されたアシスタントと会話する機能を、アプリのデザインに合わせて作る。
通信は smartlime の `useAssistant` に任せ、画面はアプリで作る。

## 前提

- 連携先の iAP に IM-Copilot（モジュール `jp.co.intra_mart.im_copilot`）が導入され、使うアシスタントが設定されていること。**smartlime は導入の有無を確かめずに API を呼ぶ**ため、アプリで実行時に確かめること（下記）
- アシスタントの ID は iAP 側の設定で決まる。推測せず、ユーザーに確認すること。接続情報と同じく `.env.local` 等に置く（例: `EXPO_PUBLIC_IAP_ASSISTANT_ID`。`smartlime-setup` の接続情報の扱いを参照）
- `useAssistant` は `/api/bearer/copilot/...` を呼ぶ。OAuth クライアントにこの API を許可するスコープが必要かは iAP 側の設定による。401・403 になる場合はユーザーに確認すること
- `expo-crypto`（ID の生成）をアプリから直接 import するため、`npx expo install expo-crypto` で依存に加える

## useAssistant の動作

```ts
const { run, getThreadHistory, deleteThread, getAssistantMetaData, getAssistantsMetaData } =
  useAssistant(assistantId, threadId);
```

| 関数 | 内容 |
|------|------|
| `run(request, callback)` | メッセージを送り、応答を `callback(message, finish)` で逐次受け取る。応答がすべて届くと Promise が解決する |
| `getThreadHistory()` | スレッドの会話履歴（`history`: `{ role, contents, toolCalls, additional }` の配列） |
| `deleteThread()` | スレッドの会話履歴を iAP から削除する |
| `getAssistantMetaData()` / `getAssistantsMetaData()` | アシスタントの情報（`name`・`description` 等） / 利用できるアシスタントの一覧 |

- **どの関数も例外を投げず**、`{ type: 'success', ... }` か `{ type: 'error', error }` を返す
- `threadId` が会話の単位。同じ `threadId` で `run` すると会話の続きになる。省略するとコンポーネントごとに自動で作られる（再マウントで別の会話になる）ため、**アプリで作って渡す**こと
- 返す関数は描画のたびに作り直される。`useEffect` の依存に入れると毎回実行されるので注意する

### 応答の受け取り方（`run` の `callback`）

- 応答は改行区切りの JSON で少しずつ届き、1 行ごとに `callback(message, finish)` が呼ばれる（SSE ではない）
- **`message.contents` は差分**（それまでの全文ではない）。表示するには連結する。`null` のこともある（ツールの呼び出しなど）ので、`?? ''` で扱う
- `finish` が `true` の呼び出しが最後（`finishReason: 'stop'`）
- 送信するメッセージ: `{ message: { role: 'user', contents: '<本文>' } }`。画像を添付する場合は `additional: ['<base64>']`（data URI ではなく base64 の文字列だけ）

### 中断できない

`run` には通信を止める手段が無い（`AbortSignal` を渡せない）。画面を離れても応答の受信は続くため、**アンマウント後は `callback` の内容を捨てる**こと（下記のフックの `mountedRef`）。送信中は再送信できないようにする。

## 会話のフック

```ts
// src/features/assistant/use-assistant-chat.ts
import { useAssistant } from '@intra-mart/smartlime';
import { randomUUID } from 'expo-crypto';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  status: 'done' | 'streaming' | 'error';
}

export function useAssistantChat(assistantId: string, threadId: string) {
  const { run, getThreadHistory } = useAssistant(assistantId, threadId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false; // run() は中断できないため、画面を離れた後の応答は捨てる
    };
  }, []);

  // スレッドの会話履歴を読み込む（新しいスレッドなら空）
  useEffect(() => {
    getThreadHistory().then((result) => {
      if (!mountedRef.current || result.type !== 'success') return;
      setMessages(
        result.history
          .filter((item) => item.contents)
          .map((item) => ({
            id: randomUUID(),
            role: item.role === 'user' ? 'user' : 'assistant',
            text: item.contents,
            status: 'done',
          })),
      );
    });
    // useAssistant が返す関数は描画のたびに作り直されるため、threadId が変わったときだけ読み込む
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assistantId, threadId]);

  const updateReply = (id: string, update: (message: ChatMessage) => ChatMessage) =>
    setMessages((prev) => prev.map((message) => (message.id === id ? update(message) : message)));

  const send = useCallback(
    async (text: string, imageBase64?: string) => {
      const replyId = randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: randomUUID(), role: 'user', text, status: 'done' },
        { id: replyId, role: 'assistant', text: '', status: 'streaming' },
      ]);
      setSending(true);

      const result = await run(
        {
          message: {
            role: 'user',
            contents: text,
            ...(imageBase64 ? { additional: [imageBase64] } : {}),
          },
        },
        (message, finish) => {
          if (!mountedRef.current) return;
          // contents は差分。null のこともある
          updateReply(replyId, (reply) => ({
            ...reply,
            text: reply.text + (message.contents ?? ''),
            status: finish ? 'done' : 'streaming',
          }));
        },
      );

      if (!mountedRef.current) return;
      setSending(false);
      updateReply(replyId, (reply) => ({
        ...reply,
        status: result.type === 'error' ? 'error' : 'done',
      }));
      if (result.type === 'error') console.error(result.error);
    },
    [run],
  );

  return { messages, sending, send };
}
```

- `messages` は古い順。`FlatList` の `inverted` で表示する場合は逆順にする
- 履歴の `role` は `'user'` 以外（アシスタントの応答など）をアシスタント側として表示している。`contents` が空の項目（ツールの呼び出しだけの項目など）は表示しない
- 応答の途中でエラーになった場合（`result.type === 'error'`）、それまでに届いた本文は残る。全体を失敗として扱うか、届いた分を見せるかはアプリで決める
- 会話を残さない用途（要約・分類など 1 回きりの問い合わせ）では、終わった後に `deleteThread()` を呼ぶ

## 画面

```tsx
// src/app/(app)/assistant.tsx
import { useIMModules, useIMModulesState } from '@intra-mart/smartlime';
import { randomUUID } from 'expo-crypto';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Text, TextInput, View } from 'react-native';

import { useAssistantChat } from '@/features/assistant/use-assistant-chat';

const ASSISTANT_ID = process.env.EXPO_PUBLIC_IAP_ASSISTANT_ID ?? '';

function AssistantChat({ threadId }: { threadId: string }) {
  const { messages, sending, send } = useAssistantChat(ASSISTANT_ID, threadId);
  const [text, setText] = useState('');

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(message) => message.id}
        renderItem={({ item }) => (
          <Text style={{ alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start', padding: 8 }}>
            {item.status === 'streaming' && !item.text ? '…' : item.text}
            {item.status === 'error' ? '（応答の取得に失敗しました）' : ''}
          </Text>
        )}
      />
      <View style={{ flexDirection: 'row', padding: 8 }}>
        <TextInput style={{ flex: 1 }} value={text} onChangeText={setText} editable={!sending} />
        <Button
          title="送信"
          disabled={sending || !text.trim()}
          onPress={() => {
            send(text.trim());
            setText('');
          }}
        />
      </View>
    </View>
  );
}

export default function AssistantScreen() {
  const { request } = useIMModules();
  const modules = useIMModulesState();
  const [threadId] = useState(() => randomUUID()); // 画面を開くたびに新しい会話にする

  useEffect(() => {
    request().catch((e) => console.error(e));
  }, [request]);

  if (!modules) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!modules['jp.co.intra_mart.im_copilot']?.enabled || !ASSISTANT_ID) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text>この iAP ではアシスタントを利用できません。</Text>
      </View>
    );
  }
  return <AssistantChat threadId={threadId} />;
}
```

- 上は最小の画面。見た目（吹き出し・アバター・キーボードの回避・自動スクロール）はアプリのデザインに合わせて作る。UI の作り方は Expo 公式スキル（`expo-native-ui` 等）を参照
- メニューやタブにアシスタントの入口を出すかどうかも、同じモジュールの確認で切り替える
- 前回の会話を続けたい場合は、`threadId` を保存（AsyncStorage 等）して使い回す
- 応答の書式（Markdown を含むか等）はアシスタントの設定による。そのまま表示するか、Markdown として描画するかはユーザーに確認する

### 画像の添付

- カメラ・写真の選択は `expo-camera` / `expo-image-picker` で `base64: true` を指定して取得し、`send(text, asset.base64)` に渡す
- `app.json` の `plugins` に権限の説明を加え、開発ビルドを作り直す

```json
{
  "expo": {
    "plugins": [
      ["expo-camera", { "cameraPermission": "アシスタントに送る写真を撮影するためにカメラを使用します。" }],
      ["expo-image-picker", { "photosPermission": "アシスタントに送る画像を選ぶために写真ライブラリを使用します。" }]
    ]
  }
}
```

- アシスタントが画像を扱えるかは iAP 側のアシスタントの設定による。ユーザーに確認すること

## smartlime-ui の IMAssistantChat について

smartlime-ui には完成済みのチャット画面 `IMAssistantChat`（`useDefaultChatProps` と組み合わせる）がある。動作の確認や試作で手早く使えるが、次の制約があるため、アプリの画面には上記のように自前で作ることを勧める。

- 見た目・文言・画面の構成を変えられない（内部に独自の画面遷移を持つ）
- カメラ・写真の権限の設定が常に必要
- エラーは `react-native-toast-message` の種類 `errorToast` で表示されるため、アプリで `<Toast config={...} />` を描画して `errorToast` を定義しないと、エラーが表示されない

## テスト

`useAssistant` をモックし、`run` の中で `callback` を呼んで応答を再現する（Jest の設定は `smartlime-testing`）。

```ts
import { useAssistant } from '@intra-mart/smartlime';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useAssistantChat } from '../use-assistant-chat';

jest.mock('@intra-mart/smartlime', () => ({ useAssistant: jest.fn() }));
jest.mock('expo-crypto', () => {
  let n = 0;
  return { randomUUID: () => `id-${++n}` };
});

it('履歴を読み込み、応答を差分でつなげて表示する', async () => {
  const run = jest.fn(async (_request, callback) => {
    callback({ role: 'assistant', contents: 'こん', toolCalls: null, additional: null }, false);
    callback({ role: 'assistant', contents: 'にちは', toolCalls: null, additional: null }, false);
    callback({ role: 'assistant', contents: null, toolCalls: null, additional: null }, true);
    return { type: 'success' as const };
  });
  jest.mocked(useAssistant).mockReturnValue({
    run,
    getThreadHistory: jest.fn().mockResolvedValue({
      type: 'success',
      history: [{ role: 'user', contents: '前回の質問', toolCalls: [], additional: [] }],
    }),
  } as never);

  const { result } = await renderHook(() => useAssistantChat('assistant-1', 'thread-1'));
  await waitFor(() => expect(result.current.messages).toHaveLength(1));

  await act(async () => {
    await result.current.send('こんにちは');
  });

  expect(result.current.messages.map((m) => [m.role, m.text, m.status])).toEqual([
    ['user', '前回の質問', 'done'],
    ['user', 'こんにちは', 'done'],
    ['assistant', 'こんにちは', 'done'],
  ]);
});
```

## 確認

- IM-Copilot が無い iAP（またはアシスタント ID 未設定）で、画面が「利用できません」になり、例外にならないこと
- 送信 → 応答が少しずつ表示される → 応答の途中で画面を離れても警告や例外が出ないこと
- 同じ `threadId` で画面を開き直すと、履歴が表示されること
- 通信を切った状態で送信し、エラーの表示になること
