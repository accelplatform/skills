/**
 * タスクメッセージ情報オブジェクト。
 *
 * 非同期タスク処理で使用されるメッセージ情報を格納します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/TaskMessage/index.html
 */
interface TaskMessage {
  /** JavaScript タスク実行の判定フラグ */
  isJsTask: boolean;
  /** エラー発生時に処理を終了するかどうか */
  isStoppingProgressOnError: boolean;
  /** メッセージID */
  messageId: string;
  /** JavaScript タスク用の実行プログラムパス */
  path: string;
  /** 直列タスクキューID */
  queueId: string;
  /** メッセージ受信時刻 */
  receiveTime: Date;
  /** メッセージ送信時刻 */
  sentTime: Date;
  /** 実行対象のタスククラス名 */
  taskClassName: string;
}
