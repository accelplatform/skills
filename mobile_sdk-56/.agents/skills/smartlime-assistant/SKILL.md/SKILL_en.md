---
name: smartlime-assistant
description: Builds a feature for chatting with an IM-Copilot assistant on intra-mart Accel Platform (iAP) with smartlime's useAssistant. Covers checking at runtime whether IM-Copilot is installed, sending messages and receiving responses incrementally (concatenating deltas), conversations (threads) and history, attaching images, dealing with the inability to abort, error handling, and building and testing a chat screen that matches the app's design. Use when the user mentions "IM-Copilot", "assistant", "AI chat", or "useAssistant".
---

# Chatting with an IM-Copilot assistant (useAssistant)

## Purpose

Build a feature for chatting with an assistant configured in iAP's IM-Copilot, matching the app's design.
Leave communication to smartlime's `useAssistant`, and build the screens in the app.

## Prerequisites

- IM-Copilot (module `jp.co.intra_mart.im_copilot`) must be installed on the target iAP, and the assistant to use must be configured. **smartlime calls the API without checking whether it is installed**, so check it at runtime in the app (below)
- The assistant ID is determined by the iAP settings. Do not guess it; confirm with the user. Put it in `.env.local` etc., like the connection information (e.g. `EXPO_PUBLIC_IAP_ASSISTANT_ID`; see the handling of connection information in `smartlime-setup`)
- `useAssistant` calls `/api/bearer/copilot/...`. Whether the OAuth client needs a scope that allows this API depends on the iAP settings. If you get 401 or 403, confirm with the user
- The app imports `expo-crypto` (ID generation) directly, so add it to the dependencies with `npx expo install expo-crypto`

## How useAssistant works

```ts
const { run, getThreadHistory, deleteThread, getAssistantMetaData, getAssistantsMetaData } =
  useAssistant(assistantId, threadId);
```

| Function | Details |
|------|------|
| `run(request, callback)` | Sends a message and receives the response incrementally via `callback(message, finish)`. The Promise resolves when the whole response has arrived |
| `getThreadHistory()` | Conversation history of the thread (`history`: an array of `{ role, contents, toolCalls, additional }`) |
| `deleteThread()` | Deletes the thread's conversation history from iAP |
| `getAssistantMetaData()` / `getAssistantsMetaData()` | Assistant information (`name`, `description`, etc.) / list of available assistants |

- **None of the functions throw**; they return `{ type: 'success', ... }` or `{ type: 'error', error }`
- `threadId` is the unit of a conversation. Calling `run` with the same `threadId` continues the conversation. If omitted, one is created automatically per component (a remount becomes a different conversation), so **create it in the app and pass it**
- The returned functions are recreated on every render. Be careful: putting them in `useEffect` dependencies runs the effect every time

### Receiving the response (`run`'s `callback`)

- The response arrives bit by bit as newline-delimited JSON, and `callback(message, finish)` is called for each line (not SSE)
- **`message.contents` is a delta** (not the full text so far). Concatenate it for display. It may be `null` (e.g. for tool calls), so handle it with `?? ''`
- The call with `finish` set to `true` is the last one (`finishReason: 'stop'`)
- Message to send: `{ message: { role: 'user', contents: '<body>' } }`. To attach an image, use `additional: ['<base64>']` (only the base64 string, not a data URI)

### Cannot abort

`run` has no way to stop the request (you cannot pass an `AbortSignal`). Receiving the response continues even after leaving the screen, so **discard the `callback` contents after unmount** (`mountedRef` in the hook below). Prevent resending while sending.

## Conversation hook

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
      mountedRef.current = false; // run() cannot be aborted, so discard responses after leaving the screen
    };
  }, []);

  // Load the thread's conversation history (empty for a new thread)
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
    // The functions returned by useAssistant are recreated on every render, so load only when threadId changes
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
          // contents is a delta. It may be null
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

- `messages` is in oldest-first order. When displaying with `FlatList`'s `inverted`, reverse it
- History items with a `role` other than `'user'` (assistant responses, etc.) are displayed on the assistant side. Items with empty `contents` (such as items that are only tool calls) are not displayed
- If an error occurs partway through the response (`result.type === 'error'`), the text received so far remains. Decide in the app whether to treat the whole thing as a failure or to show what arrived
- For uses that do not keep the conversation (one-off queries such as summarization or classification), call `deleteThread()` when done

## Screen

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
            {item.status === 'error' ? ' (Failed to get a response)' : ''}
          </Text>
        )}
      />
      <View style={{ flexDirection: 'row', padding: 8 }}>
        <TextInput style={{ flex: 1 }} value={text} onChangeText={setText} editable={!sending} />
        <Button
          title="Send"
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
  const [threadId] = useState(() => randomUUID()); // Start a new conversation each time the screen opens

  useEffect(() => {
    request().catch((e) => console.error(e));
  }, [request]);

  if (!modules) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!modules['jp.co.intra_mart.im_copilot']?.enabled || !ASSISTANT_ID) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text>The assistant is not available on this iAP.</Text>
      </View>
    );
  }
  return <AssistantChat threadId={threadId} />;
}
```

- The above is a minimal screen. Build the look (speech bubbles, avatars, keyboard avoidance, auto-scroll) to match the app's design. For building UI, see the official Expo skills (`expo-native-ui`, etc.)
- Whether to show an entry point to the assistant in menus or tabs is also switched by the same module check
- To continue the previous conversation, save `threadId` (AsyncStorage, etc.) and reuse it
- The response format (whether it contains Markdown, etc.) depends on the assistant settings. Confirm with the user whether to display it as is or render it as Markdown

### Attaching images

- Get photos from the camera or photo selection with `expo-camera` / `expo-image-picker` specifying `base64: true`, and pass them to `send(text, asset.base64)`
- Add permission descriptions to `plugins` in `app.json` and rebuild the development build

```json
{
  "expo": {
    "plugins": [
      ["expo-camera", { "cameraPermission": "Uses the camera to take photos to send to the assistant." }],
      ["expo-image-picker", { "photosPermission": "Uses the photo library to choose images to send to the assistant." }]
    ]
  }
}
```

- Whether the assistant can handle images depends on the assistant settings on the iAP side. Confirm with the user

## About smartlime-ui's IMAssistantChat

smartlime-ui has a ready-made chat screen, `IMAssistantChat` (used together with `useDefaultChatProps`). It is quick to use for checking behavior or prototyping, but because of the following constraints, building your own as above is recommended for the app's screens.

- The look, text, and screen structure cannot be changed (it has its own internal navigation)
- Camera and photo permission settings are always required
- Errors are shown with the `react-native-toast-message` type `errorToast`, so unless the app renders `<Toast config={...} />` and defines `errorToast`, errors are not shown

## Tests

Mock `useAssistant`, and reproduce the response by calling `callback` inside `run` (for Jest setup, see `smartlime-testing`).

```ts
import { useAssistant } from '@intra-mart/smartlime';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useAssistantChat } from '../use-assistant-chat';

jest.mock('@intra-mart/smartlime', () => ({ useAssistant: jest.fn() }));
jest.mock('expo-crypto', () => {
  let n = 0;
  return { randomUUID: () => `id-${++n}` };
});

it('loads the history and displays the response by concatenating deltas', async () => {
  const run = jest.fn(async (_request, callback) => {
    callback({ role: 'assistant', contents: 'Hel', toolCalls: null, additional: null }, false);
    callback({ role: 'assistant', contents: 'lo', toolCalls: null, additional: null }, false);
    callback({ role: 'assistant', contents: null, toolCalls: null, additional: null }, true);
    return { type: 'success' as const };
  });
  jest.mocked(useAssistant).mockReturnValue({
    run,
    getThreadHistory: jest.fn().mockResolvedValue({
      type: 'success',
      history: [{ role: 'user', contents: 'Previous question', toolCalls: [], additional: [] }],
    }),
  } as never);

  const { result } = await renderHook(() => useAssistantChat('assistant-1', 'thread-1'));
  await waitFor(() => expect(result.current.messages).toHaveLength(1));

  await act(async () => {
    await result.current.send('Hello');
  });

  expect(result.current.messages.map((m) => [m.role, m.text, m.status])).toEqual([
    ['user', 'Previous question', 'done'],
    ['user', 'Hello', 'done'],
    ['assistant', 'Hello', 'done'],
  ]);
});
```

## Verification

- On an iAP without IM-Copilot (or with no assistant ID set), the screen shows "not available" and no exception occurs
- Send → the response is displayed bit by bit → no warning or exception occurs even when leaving the screen partway through the response
- Reopening the screen with the same `threadId` shows the history
- Sending with the network disconnected shows the error display
