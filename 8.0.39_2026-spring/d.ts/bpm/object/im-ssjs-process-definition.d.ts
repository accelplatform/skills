/**
 * プロセス定義情報オブジェクト。
 *
 * プロセス定義情報を格納するオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/ProcessDefinition/index.html
 */
interface ProcessDefinition {
  /** カテゴリ */
  readonly category: string;
  /** デプロイメントID */
  readonly deploymentId: string;
  /** 説明 */
  readonly description: string;
  /** ダイアグラムリソース名 */
  readonly diagramResourceName: string;
  /** グラフィック表記有無 */
  readonly hasGraphicalNotation: boolean;
  /** 開始時のフォームキーの有無 */
  readonly hasStartFormKey: boolean;
  /** プロセス定義ID */
  readonly id: string;
  /** プロセス定義キー */
  readonly key: string;
  /** 名前 */
  readonly name: string;
  /** リソース名 */
  readonly resourceName: string;
  /** 中断 */
  readonly suspended: boolean;
  /** プロセス定義種別 */
  readonly type: ProcessDefinition.Type;
  /** バージョン */
  readonly version: number;
}

declare namespace ProcessDefinition {
  type Type =
    /** ケース定義 */
    | 'CASE'
    /** プロセス定義 */
    | 'PROCESS';
}
