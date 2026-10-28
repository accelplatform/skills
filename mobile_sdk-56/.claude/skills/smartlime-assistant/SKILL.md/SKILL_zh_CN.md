---
name: smartlime-assistant
description: 使用 smartlime 的 useAssistant 制作与 intra-mart Accel Platform（iAP）IM-Copilot 助手对话的功能。涵盖运行时确认是否已安装 IM-Copilot、消息的发送与回复的逐步接收（差分的拼接）、会话（线程）与历史记录、图片的附加、无法中断的应对、错误的处理，以及配合应用设计的聊天画面的制作方法和测试。当提及「IM-Copilot」「助手」「AI 聊天」「useAssistant」时使用。
---

# 与 IM-Copilot 助手的对话（useAssistant）

## 目的

配合应用的设计，制作与 iAP 的 IM-Copilot 中所设置的助手进行对话的功能。
通信交给 smartlime 的 `useAssistant`，画面由应用制作。

## 前提条件

- 对接的 iAP 已安装 IM-Copilot（模块 `jp.co.intra_mart.im_copilot`），并已设置要使用的助手。**smartlime 不会确认是否已安装就直接调用 API**，因此必须在应用中于运行时进行确认（见下文）
- 助手的 ID 由 iAP 端的设置决定。不得凭推测，必须向用户确认。与连接信息一样，放在 `.env.local` 等处（例：`EXPO_PUBLIC_IAP_ASSISTANT_ID`。参见 `smartlime-setup` 中连接信息的处理）
- `useAssistant` 会调用 `/api/bearer/copilot/...`。OAuth 客户端是否需要允许此 API 的范围取决于 iAP 端的设置。出现 401・403 时必须向用户确认
- 由于应用会直接 import `expo-crypto`（生成 ID），请通过 `npx expo install expo-crypto` 将其加入依赖

## useAssistant 的行为

```ts
const { run, getThreadHistory, deleteThread, getAssistantMetaData, getAssistantsMetaData } =
  useAssistant(assistantId, threadId);
```

| 函数 | 内容 |
|------|------|
| `run(request, callback)` | 发送消息，并通过 `callback(message, finish)` 逐步接收回复。回复全部到达后 Promise resolve |
| `getThreadHistory()` | 线程的会话历史（`history`：`{ role, contents, toolCalls, additional }` 的数组） |
| `deleteThread()` | 从 iAP 删除线程的会话历史 |
| `getAssistantMetaData()` / `getAssistantsMetaData()` | 助手的信息（`name`・`description` 等） / 可用助手的一览 |

- **所有函数都不会抛出异常**，而是返回 `{ type: 'success', ... }` 或 `{ type: 'error', error }`
- `threadId` 是会话的单位。使用相同的 `threadId` 执行 `run` 即可延续会话。省略时会为每个组件自动生成（重新挂载后会变成另一个会话），因此必须**由应用生成并传入**
- 返回的函数在每次渲染时都会重新创建。注意如果将其放入 `useEffect` 的依赖中，每次都会执行

### 回复的接收方式（`run` 的 `callback`）

- 回复以换行分隔的 JSON 形式陆续到达，每一行调用一次 `callback(message, finish)`（不是 SSE）
- **`message.contents` 是差分**（不是到目前为止的全文）。显示时需要拼接。也可能为 `null`（工具调用等），因此用 `?? ''` 处理
- `finish` 为 `true` 的调用是最后一次（`finishReason: 'stop'`）
- 发送的消息：`{ message: { role: 'user', contents: '<正文>' } }`。附加图片时为 `additional: ['<base64>']`（仅为 base64 字符串，而不是 data URI）

### 无法中断

`run` 没有停止通信的手段（无法传入 `AbortSignal`）。即使离开画面，回复的接收仍会继续，因此**卸载后必须丢弃 `callback` 的内容**（下文钩子中的 `mountedRef`）。发送期间应禁止重新发送。

## 会话的钩子

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
      mountedRef.current = false; // run() 无法中断，因此丢弃离开画面后的回复
    };
  }, []);

  // 读取线程的会话历史（新线程则为空）
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
    // useAssistant 返回的函数在每次渲染时都会重新创建，因此只在 threadId 变化时读取
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
          // contents 是差分。也可能为 null
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

- `messages` 按从旧到新的顺序排列。使用 `FlatList` 的 `inverted` 显示时需反转顺序
- 历史记录中 `role` 为 `'user'` 以外（助手的回复等）的项目显示为助手一方。`contents` 为空的项目（仅包含工具调用的项目等）不显示
- 如果在回复过程中出错（`result.type === 'error'`），已到达的正文会保留。是将整体视为失败，还是显示已到达的部分，由应用决定
- 对于不保留会话的用途（摘要・分类等一次性的询问），结束后调用 `deleteThread()`

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
            {item.status === 'error' ? '（获取回复失败）' : ''}
          </Text>
        )}
      />
      <View style={{ flexDirection: 'row', padding: 8 }}>
        <TextInput style={{ flex: 1 }} value={text} onChangeText={setText} editable={!sending} />
        <Button
          title="发送"
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
  const [threadId] = useState(() => randomUUID()); // 每次打开画面时开始新的会话

  useEffect(() => {
    request().catch((e) => console.error(e));
  }, [request]);

  if (!modules) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!modules['jp.co.intra_mart.im_copilot']?.enabled || !ASSISTANT_ID) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text>此 iAP 无法使用助手。</Text>
      </View>
    );
  }
  return <AssistantChat threadId={threadId} />;
}
```

- 上面是最简单的画面。外观（气泡・头像・避开键盘・自动滚动）请配合应用的设计制作。UI 的制作方法请参见 Expo 官方技能（`expo-native-ui` 等）
- 是否在菜单或标签页中显示助手的入口，也通过同样的模块确认来切换
- 如果希望延续上一次的会话，请保存 `threadId`（AsyncStorage 等）并重复使用
- 回复的格式（是否包含 Markdown 等）取决于助手的设置。是直接显示还是作为 Markdown 渲染，应向用户确认

### 图片的附加

- 相机・照片的选择使用 `expo-camera` / `expo-image-picker` 并指定 `base64: true` 获取，然后传给 `send(text, asset.base64)`
- 在 `app.json` 的 `plugins` 中添加权限说明，并重新制作开发构建

```json
{
  "expo": {
    "plugins": [
      ["expo-camera", { "cameraPermission": "使用相机拍摄要发送给助手的照片。" }],
      ["expo-image-picker", { "photosPermission": "使用照片库选择要发送给助手的图片。" }]
    ]
  }
}
```

- 助手是否能处理图片取决于 iAP 端助手的设置。必须向用户确认

## 关于 smartlime-ui 的 IMAssistantChat

smartlime-ui 中有现成的聊天画面 `IMAssistantChat`（与 `useDefaultChatProps` 组合使用）。可以在确认运行或制作原型时快速使用，但由于存在以下限制，建议应用的画面按上文所示自行制作。

- 无法更改外观・文字・画面的构成（内部有自己的画面跳转）
- 始终需要设置相机・照片的权限
- 错误通过 `react-native-toast-message` 的类型 `errorToast` 显示，因此如果应用不渲染 `<Toast config={...} />` 并定义 `errorToast`，错误将不会显示

## 测试

对 `useAssistant` 进行 mock，在 `run` 中调用 `callback` 来模拟回复（Jest 的设置参见 `smartlime-testing`）。

```ts
import { useAssistant } from '@intra-mart/smartlime';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useAssistantChat } from '../use-assistant-chat';

jest.mock('@intra-mart/smartlime', () => ({ useAssistant: jest.fn() }));
jest.mock('expo-crypto', () => {
  let n = 0;
  return { randomUUID: () => `id-${++n}` };
});

it('读取历史记录，并将回复的差分拼接后显示', async () => {
  const run = jest.fn(async (_request, callback) => {
    callback({ role: 'assistant', contents: '你', toolCalls: null, additional: null }, false);
    callback({ role: 'assistant', contents: '好', toolCalls: null, additional: null }, false);
    callback({ role: 'assistant', contents: null, toolCalls: null, additional: null }, true);
    return { type: 'success' as const };
  });
  jest.mocked(useAssistant).mockReturnValue({
    run,
    getThreadHistory: jest.fn().mockResolvedValue({
      type: 'success',
      history: [{ role: 'user', contents: '上次的问题', toolCalls: [], additional: [] }],
    }),
  } as never);

  const { result } = await renderHook(() => useAssistantChat('assistant-1', 'thread-1'));
  await waitFor(() => expect(result.current.messages).toHaveLength(1));

  await act(async () => {
    await result.current.send('你好');
  });

  expect(result.current.messages.map((m) => [m.role, m.text, m.status])).toEqual([
    ['user', '上次的问题', 'done'],
    ['user', '你好', 'done'],
    ['assistant', '你好', 'done'],
  ]);
});
```

## 确认

- 在没有 IM-Copilot 的 iAP（或未设置助手 ID）中，画面显示“无法使用”，且不会抛出异常
- 发送 → 回复逐步显示 → 在回复过程中离开画面也不会出现警告或异常
- 使用相同的 `threadId` 重新打开画面时，会显示历史记录
- 在断开网络的状态下发送，会显示错误
