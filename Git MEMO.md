# Git学習用
## 文字列頻度検出テスト
### 正規表現メモ
- 文字クラス指定とunicode指定
今回はunicode指定で^否定の\p{L}と\p{N}LはLetter文字列、NはNumber数値を除く
指定にｇグローバル（すべて）のあとuを付けないとunicode指定できない。

- Intl.Segmenterを試した結果見送った理由
'word'で切り分けると、過去形「使った」＝「使」「っ」「た」や「高さ」＝「高」「さ」など動詞や形容詞が分割されすぎる,'sentence'だと「、」で切り分けず長文になる。
- 使うなら'sentence'で取り出した後splitで切り分け直す作業が必要、ライブラリを使わない軽量、手軽さで正規表現になりました。
- 正規表現のプロパティは見やすくしていますが、unicode指定や文字クラスで細かく調整できます。
- 今後、可能ならWeb Workerを使って正規表現のプリセットやIntl.Segmenterの切り替え機能も試したい。

- (/[0-9０-９!-/:-@\[-`{-~\u3000-\u303F]/g, ' ')
- (/[0-9０-９!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, " ")
- (/[^\p{L}\p{N}]+/gu, " ")

### 使ったもの

#### CSS
- font-family:フォントの種類
- font-size:文字の大きさ
- sans-serif:文字の端に装飾のないシンプル書体
- font-weight:文字の太さ
- height:高さ指定
- width：幅指定
- max-width：最大幅
- margin:要素の外側の余白、値は時計回り
- margin-top：要素外側の上の余白
- margin-bottom:要素の外側の下の余白
- padding:要素の内側の余白、値は時計回り
- padding-bottom:要素の内側の下側の余白
- background:背景色
- transition:状態変化のディレイ速度
- border:線の色、色、スタイル、太さ
- border-bottom:要素の下線、色、スタイル、太さ
- border-radius:面取り、角を丸める
- box-shadow:要素に影を付け立体的に表現
- color:文字の色
- cursor:マウスカーソルの形を変える

#### Javascript
- split:配列を切り分ける
- trim:要素の左右の余白を取り除く
- replace:要素の置き換え
- filter:指定要素以外を取り出し配列生成
- length:要素の数
- includes:指定要素が含まれているか論理値で返す
- toLowerCase:要素を小文字化
- innerHTML:HTML要素として返す
- sort:要素の並び替え、昇順降順を指定
- slice:要素を指定値で切り取り
- textContent:要素をtextに変換
- entries:配列内容を[キー、値]のペアで取り出す
- forEach:配列内の要素を1巡する
- keys:連想配列のキーのみ取得
- values:連想配列の値のみ取得
- `${}`:テンプレートリテラル、要素の変数名の式、関数をそのまま呼び出しでき要素ごとに改行する。
- (count[w] || 0)+1 :要素の初期値を0にする、undefind+1を回避する
- toggle:CSSの指定を切り替える

#### CSVダウンロード
- BON（ByteOderMark）：0xEF,0xBB,0xBFをファイルの先頭に付けると文字定義がUTF-8であるとExcelが認識できる。文字出力の互換定義。

- Blob（Binary Large Object）：データ（画像、動画、文字など）をバイナリデータとして生成できる。
クライアントやアプリのデータ定義の互換性に役立つ。
大きなデータだと出力が膨大になるのでメモリ注意。
受け取りで使うとセキュリティリスクがあるのでサニタイズが必要。CSP（Content Security Policy）を設定するなど対策する。

- 演算子replace(/^[=+\-@]/, "'$&")を出力前に除去

#### URL.createObjectURL()
- javascriptでBlobやFileオブジェクトから一時的なURLを生成するメソッド、画像プレビュー、動画再生、ファイルダウンロードなどに使える。
- ブラウザ上のメモリにデータを参照させる為、サイズや時間によってメモリリークを起こす恐れがあるため、使用後は速やかにURL.revokeObjectURL()でメモリを開放する。
- windowが閉じられるまで実行され続ける。
<img><video><a>ハイパーリンクなどを即座に表示、実行できる。

#### textareaにDragandDropに対応する
- DropAPIとFileAPIについて、調べる
Elementを作成、変数に代入し初期化、受け取り準備としてブラウザの初期動作（そのまま別タグ表示する）をdragoverとdragleaveとをdrop指定し.preventDefault()で無効化処理。
.dataTransfer.filesでdropされたファイルのFileオブジェクトをtextで受け取る。
reader.readAsText(file);でtextareaに表示する。

- DropAPIのオブジェクト
preventDefault()
ブラウザのdefault動作無効化、イベントリスナーでdragover、dragleave、dropでドロップされた際の動作を指定する。
.dataTransfer.files
dropされたファイルを指定の変数名で受け取る

- .type.indexOf()
配列内から引数で指定された要素の出現位置を検索しその値（インデックス）を返す、なければ-1を返す。
.endsWith()
文字列に引数で指定した文字が一致するか判定、論理型（true　false）で返す。

- FileAPIのオブジェクト
FileReader()
受け取ったfileの読み取りを行うオブジェクト、テキスト（readAsText()）や画像（readAsDataURL()）、バイナリデータ（readAsArrayBuffer()）を受けとるメソッドを持つ、また受けとり時のエラーハンドリングメソッド（正常終了.onload、onerrorエラー発生）を持つ。変数.target.resultに読み取ったデータを渡す。

#### ダークモードを（color-scheme + ボタン）に対応する。
- 現在のトグル切り替え式に加えschemeでOSやブラウザの設定からも切り替えに対応。
2種類の系統を一元管理したい。
ボタンをtextContent での制御(btn.textContent === 'ダークモード')から
window.matchMedia().matchesでCSSのメディアクエリで制御する。

-  windowオブジェクト
ブラウザのウィンドウ、最上位のグローバルオブジェクト（スコープ）DOM,スクロールや画面操作、URL情報等の操作メソッドを持つ
.matchMedia().matches
引数でCSSなどの情報をを受け取りElementで比較、論理型で返す。レスポンシブによく使われる。

- loadingのアニメーション
DOM'blink'を作って装飾しようと思ったのですが、機能の割に華美になったのでloadingの文字点滅程度にとどめました。

#### DOM
- loading、#btn、click、dark-theme、download-btn、input、exclude、result、li、a
- 

#### 変数遷移
- input＞text＞cleaned＞words＞（!exclude）＞counts＞li（words,counts）＞latestcounts＞rows＞csvOutput＞a＞data.csv



