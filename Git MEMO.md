# WEB学習用
## 文字列頻度検出テスト

### 主なフロー
- 変数遷移
- input＞text＞cleaned＞words＞（!入力テキスト('input')>text>text.value(files>file)>cleaned>words>!（除外ワード('exclude')）>w>t>counts(>li画面出力result)>latestCount>rows>safeRows>a>data.csv

- 入力
drop、ペースト、直打ち ＞textareaでテキスト受け取り。
＞text（input）
dataTransfer.filesでテキスト化＞filesが空でなければその要素＞file
fileが1000000文字以上ならalert＞return
file名を小文字化して拡張子が.txtか論理型isTxtExtでtrue代入
file.typeが空か'text/plain’か論理型isTextMimeでtrue代入
isTxtExt＝falseかisTextMime＝falseどちらかfalseならalert>return。
fileプロパティにtextが含まれているか、拡張子が.txt（読み込めるファイルがある）であればコンストラクタFileReaderでインスタンス生成、reader命名、.onloadでファイル読み込み（readAsText(file)）が完了すると発火、textareaにfileを文字列として表示する。

- 解析実行ボタン押下（メインボタンなのでonClick）
analyze関数実行
除外ワードexcludeで受け取る、trimで余白とって小文字化。
text要素から余白をとって、空ならalert＞return
textから正規表現で文字列、数字をunicode指定してそれ以外は空白に置き換えてcleanedに代入、空白部分で分割し10000要素までとりだしてwordsに代入、loadingにtextで処理中表示それにblinkを追加して点滅させる。
result空白表示
setTimeout関数
wordsを小文字化したものをｔに代入、words要素で1文字を除去、ｔ要素でexcludeと一致するものは除外して各要素ごとにcounts（値）を同じキーがあるごとに+1していく。
fragmentをつかってcounts要素の値を昇順に20要素までをキー、値を1セットにliにtextとして追加していく、appendChildで描画、画面表示、countsが空なら"単語が見つかりませんでした"表示、CSVダウンロードボタン無効のままreturn
画面表示要素があるなら、CSVダウンロードボタン有効化、loading空白、blinkはremove
グローバルlatestContentにcountsを代入

- 出力
CSVダウンロード
latestContentの値で昇順、20要素まで取り出し、要素内から演算子で始まるものを置き換えたものをsafeRowsに代入。
csvOutputにヘッダーとしてword,countを最初に代入、その後safeRowsを要素ごとに改行して代入、Blobインスタンスの要素にUint8Arrayインスタンスで[0xEF, 0xBB, 0xBF]を合わせたcsvOutputにMime'text/csv'を付与した配列をメモリ上から直接アクセスできるリンクを生成し、url変数に代入、HTMLアンカーオブジェクトaのメソッドdownloadに'data.csv'を指定しHTMLメソッドclickでurlをパージしメモリを開放する。

### 正規表現メモ
- 文字クラス指定とunicode指定
今回はunicode指定で^否定の\p{L}と\p{N}LはLetter文字列、NはNumber数値を除く
指定にｇグローバル（すべて）のあとuを付けないとunicode指定できない。
- Intl.Segmenterを試した結果見送った理由
'word'で切り分けると、過去形「使った」＝「使」「っ」「た」や「高さ」＝「高」「さ」など動詞や形容詞が分割されすぎる,'sentence'だと「、」で切り分けず長文になる。
- 使うなら'sentence'で取り出した後splitで切り分け直す作業が必要、ライブラリを使わない軽量、手軽さで正規表現になりました。
- 正規表現のプロパティは見やすくしていますが、unicode指定や文字クラスで細かく調整できます。
- 今後、可能ならWeb Workerを使って正規表現のプリセットやIntl.Segmenterの切り替え機能も試したい。
const presets = {
  words: /[^\p{L}\p{N}]+/gu,
  numbers: /[^\d]+/g,
  hiragana: /[^\p{Script=Hiragana}]+/gu
}

#### CSVダウンロード
- BON（ByteOderMark）：0xEF,0xBB,0xBFをファイルの先頭に付けると文字定義がUTF-8であるとExcelが認識できる。文字出力の互換定義。
- Blob（Binary Large Object）：データ（画像、動画、文字など）をメモリ上のバイナリデータ、メモリ上の一時データを直接扱える。
大きなデータだと出力が膨大になるのでメモリ注意。
受け取りで使うとセキュリティリスクがあるのでサニタイズが必要。CSP（Content Security Policy）を設定するなど対策する。
- 演算子replace(/^[=+\-@]/, "'$&")を出力前に除去
- URL.createObjectURL()
- javascriptでBlobやFileオブジェクトから一時的なURLを生成するメソッド、画像プレビュー、動画再生、ファイルダウンロードなどに使える。
- windowが閉じられるまで実行され続けるためサイズやデータによってメモリリークを起こす恐れがあるため、使用後は速やかにURL.revokeObjectURL()でメモリを開放する。
<img><video><a>ハイパーリンクなどを即座に表示、実行できる。

#### テキストエリア内にドラッグ＆ドロップに対応
- textareaにDragandDropに対応する。
- DropAPIとFileAPIを使う。
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
- .endsWith()
文字列に引数で指定した文字が一致するか判定、論理型（true　false）で返す。
- FileAPIのオブジェクト
FileReader()
受け取ったfileの読み取りを行うオブジェクト、テキスト（readAsText()）や画像（readAsDataURL()）、バイナリデータ（readAsArrayBuffer()）を受けとるメソッドを持つ、また受けとり時のエラーハンドリングメソッド（正常終了.onload、onerrorエラー発生）を持つ。変数.target.resultに読み取ったデータを渡す。

#### ダークモードを（color-scheme + ボタン）に対応する。
- 現在のトグル切り替え式に加えschemeでOSやブラウザの設定からも切り替えに対応。
2種類の系統を一元管理したい。
btnにisDark（論理型）で制御、テキストとcssを切り替え、初期値はschemeで取得。
-  windowオブジェクト
ブラウザのウィンドウ、最上位のグローバルオブジェクト（スコープ）DOM,スクロールや画面操作、URL情報等の操作メソッドを持つ
.matchMedia().matches
引数でCSSなどの情報をを受け取りElementで比較、論理型で返す。レスポンシブによく使われる。

#### loadingのアニメーション
'blink'で必要な間だけアニメーション,@keyframesでアニメーションを指定できる。

### セキュリティ
- 入力時テキストデータで受け取る、チェックとしてmimeの'text/plain'で制限、拡張子が.txtである事で選り分け、その後出力時はtextContextでテキスト化しています。
出力時Excelなどで読みだした際、安全に開けられるように演算子を取り除いてからCSV出力、cmdが勝手に起動することがないようにしています。

### メモリ節約
- 受け取り要素は10000まで、文字数は1000000まで。、
配列操作が多いので、当初べた書きが多かったのですが、なるべくメソッドチェーンでまとめて処理するように努めています。
fragmentで不要な再描画て押さえています。
URL.revokeObjectURL(url)でいらなくなったLinkはパージ開放します。

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
- カスタムプロパティ:繰り返し使う値を登録しておき管理しやすくする。

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
- Object.entries:配列内容を[キー、値]のペアで取り出す。[a,1][b,2]
- Object.keys:配列内容の値をキー順に取り出す。[a,b]
- Object.values:連想配列の値のみ取得
- forEach:配列内の要素を1巡する
- forin:for（制御変数　in　オブジェクト）オブジェクトの「キー（プロパティ名）」順序不定（環境依存）オブジェクトの全プロパティ操作　オブジェクト（Object）用
- forof:for（制御変数　of　オブジェクト）イテラブル（配列や文字列など）の「値」定義された順序（順序が保証される）配列の全要素の順次処理　配列(Array)用
- map:新しい配列を返す
- Uint8Array:型付き配列8ビット符号なし0～255の範囲で扱う。
- Blob(blobParts, options)第1引数にデータ内容の配列、　第2引数にMIME（Multipurpose Internet Mail Extensions）タイプ等のプロパティ
- `${}`:テンプレートリテラル、要素の変数名の式、関数をそのまま呼び出しでき要素ごとに改行する。
- (count[w] || 0)+1 :要素の初期値を0にする、undefind+1を回避する
- toggle:CSSの指定を切り替える
- DocumentFragment:Documentが繰り返し更新される都度、再描画しなくて良くなる。
