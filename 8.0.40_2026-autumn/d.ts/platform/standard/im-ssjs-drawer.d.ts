/**
 * 画像描画クラス。
 *
 * 画像ファイルの描画・生成を行う API を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Drawer/index.html
 */
declare class Drawer {
  /**
   * 指定されたサイズで、Drawer クラスのインスタンスを生成します。
   *
   * @param imageWidth 画像の幅
   * @param imageHeight 画像の高さ
   */
  constructor(imageWidth: number, imageHeight: number);

  /**
   * クリッピング領域を解除します。
   */
  clearClip(): void;

  /**
   * コンポーネントの領域をコピーします。
   *
   * @param x ソース矩形の X 座標
   * @param y ソース矩形の Y 座標
   * @param width 幅
   * @param height 高さ
   * @param dx 水平移動距離
   * @param dy 垂直移動距離
   */
  copyArea(x: number, y: number, width: number, height: number, dx: number, dy: number): void;

  /**
   * 3D 強調表示の矩形の輪郭を描画します。
   *
   * @param x X 座標
   * @param y Y 座標
   * @param width 幅
   * @param height 高さ
   * @param raised 浮き上がり表示の場合 true
   */
  draw3DRect(x: number, y: number, width: number, height: number, raised: boolean): void;

  /**
   * 円弧または楕円弧の輪郭を描画します。
   *
   * @param x X 座標
   * @param y Y 座標
   * @param width 幅
   * @param height 高さ
   * @param startAngle 開始角度
   * @param arcAngle 弧の角度
   */
  drawArc(x: number, y: number, width: number, height: number, startAngle: number, arcAngle: number): void;

  /**
   * 2 点間に線を描画します。
   *
   * @param x1 始点の X 座標
   * @param y1 始点の Y 座標
   * @param x2 終点の X 座標
   * @param y2 終点の Y 座標
   */
  drawLine(x1: number, y1: number, x2: number, y2: number): void;

  /**
   * 楕円の輪郭を描画します。
   *
   * @param x X 座標
   * @param y Y 座標
   * @param width 幅
   * @param height 高さ
   */
  drawOval(x: number, y: number, width: number, height: number): void;

  /**
   * 閉じた多角形を描画します。
   *
   * @param xPoints X 座標の配列
   * @param yPoints Y 座標の配列
   */
  drawPolygon(xPoints: number[], yPoints: number[]): void;

  /**
   * 矩形の輪郭を描画します。
   *
   * @param x X 座標
   * @param y Y 座標
   * @param width 幅
   * @param height 高さ
   */
  drawRect(x: number, y: number, width: number, height: number): void;

  /**
   * 角丸矩形の輪郭を描画します。
   *
   * @param x X 座標
   * @param y Y 座標
   * @param width 幅
   * @param height 高さ
   * @param arcWidth 角丸の水平径
   * @param arcHeight 角丸の垂直径
   */
  drawRoundRect(x: number, y: number, width: number, height: number, arcWidth: number, arcHeight: number): void;

  /**
   * テキストを描画します。
   *
   * @param str 描画する文字列
   * @param x X 座標
   * @param y Y 座標
   * @param xPosition X 位置指定
   * @param yPosition Y 位置指定
   */
  drawString(str: string, x: number, y: number, xPosition?: number, yPosition?: number): void;

  /**
   * 3D 強調表示の矩形を塗りつぶします。
   *
   * @param x X 座標
   * @param y Y 座標
   * @param width 幅
   * @param height 高さ
   * @param raised 浮き上がり表示の場合 true
   */
  fill3DRect(x: number, y: number, width: number, height: number, raised: boolean): void;

  /**
   * 円弧または楕円弧を塗りつぶします。
   *
   * @param x X 座標
   * @param y Y 座標
   * @param width 幅
   * @param height 高さ
   * @param startAngle 開始角度
   * @param arcAngle 弧の角度
   */
  fillArc(x: number, y: number, width: number, height: number, startAngle: number, arcAngle: number): void;

  /**
   * 楕円を塗りつぶします。
   *
   * @param x X 座標
   * @param y Y 座標
   * @param width 幅
   * @param height 高さ
   */
  fillOval(x: number, y: number, width: number, height: number): void;

  /**
   * 多角形を塗りつぶします。
   *
   * @param xPoints X 座標の配列
   * @param yPoints Y 座標の配列
   */
  fillPolygon(xPoints: number[], yPoints: number[]): void;

  /**
   * 矩形を塗りつぶします。
   *
   * @param x X 座標
   * @param y Y 座標
   * @param width 幅
   * @param height 高さ
   */
  fillRect(x: number, y: number, width: number, height: number): void;

  /**
   * 角丸矩形を塗りつぶします。
   *
   * @param x X 座標
   * @param y Y 座標
   * @param width 幅
   * @param height 高さ
   * @param arcWidth 角丸の水平径
   * @param arcHeight 角丸の垂直径
   */
  fillRoundRect(x: number, y: number, width: number, height: number, arcWidth: number, arcHeight: number): void;

  /**
   * 現在の描画色を取得します。
   *
   * @return RGB カラー値
   */
  getColor(): string;

  /**
   * 現在のフォント名を取得します。
   *
   * @return フォント名
   */
  getFontName(): string;

  /**
   * 現在のフォントサイズを取得します。
   *
   * @return フォントサイズ（ポイント）
   */
  getFontSize(): string;

  /**
   * 現在のフォントスタイルを取得します。
   *
   * @return 'plain', 'bold', 'italic', 'italic_bold' のいずれか
   */
  getFontStyle(): Drawer.FontStyle;

  /**
   * 現在の線幅を取得します。
   *
   * @return 線幅
   */
  getLineSize(): number;

  /**
   * 現在の破線パターンを取得します。
   *
   * @return 破線パターン配列。実線の場合 null
   */
  getLineStyle(): number[] | null;

  /**
   * 画像データをバイナリ文字列として取得します。
   *
   * @param imageType 画像種別（'png' または 'jpeg'）
   * @return バイナリ画像データ
   */
  putImage(imageType: string): string;

  /**
   * 円弧のクリッピング領域を設定します。
   *
   * @param x X 座標
   * @param y Y 座標
   * @param width 幅
   * @param height 高さ
   * @param start 開始角度
   * @param extent 弧の角度
   */
  setClipArc(x: number, y: number, width: number, height: number, start: number, extent: number): void;

  /**
   * 多角形のクリッピング領域を設定します。
   *
   * @param xPoints X 座標の配列
   * @param yPoints Y 座標の配列
   */
  setClipPolygon(xPoints: number[], yPoints: number[]): void;

  /**
   * 矩形のクリッピング領域を設定します。
   *
   * @param x X 座標
   * @param y Y 座標
   * @param width 幅
   * @param height 高さ
   */
  setClipRect(x: number, y: number, width: number, height: number): void;

  /**
   * 描画色を設定します。
   *
   * @param color 色名または色値
   */
  setColor(color: string): void;

  /**
   * テキスト描画のフォント名を設定します。
   *
   * @param font フォント名
   */
  setFontName(font: string): void;

  /**
   * テキスト描画のフォントサイズを設定します。
   *
   * @param size フォントサイズ
   */
  setFontSize(size: number): void;

  /**
   * テキスト描画のフォントスタイルを設定します。
   *
   * @param style 'plain', 'bold', 'italic', 'italic_bold' のいずれか
   */
  setFontStyle(style: Drawer.FontStyle): void;

  /**
   * 線幅を設定します。
   *
   * @param lineSize 線幅
   */
  setLineSize(lineSize: number): void;

  /**
   * 破線パターンを設定します。
   *
   * @param lineStyle 破線パターン配列。null で実線
   */
  setLineStyle(lineStyle: number[] | null): void;
}

declare namespace Drawer {
  type FontStyle = 'plain' | 'bold' | 'italic' | 'italic_bold';
}
