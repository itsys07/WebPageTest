let latestCounts = {};

const loading = document.getElementById('loading');

let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
// 初期反映
if (isDark) {
    document.body.classList.add('dark-theme');
}
const darkBtn = document.querySelector('#darkBtn');

darkBtn.addEventListener('click', () => {
    isDark = !isDark;
    document.body.classList.toggle('dark-theme', isDark);
    darkBtn.textContent = isDark ? "ライトモード" : "ダークモード";
});

//Dropイベントでファイルを受け取る、再読み込みを防ぐ
const text = document.getElementById('input');
// デフォルト動作を無効化
document.addEventListener('dragover', e => e.preventDefault());
text.addEventListener('dragover', () => {
    text.classList.add('dragover');
});

// ドラッグがエリアから外れた時
text.addEventListener('dragleave', () => {
    text.classList.remove('dragover');
});

// ドロップ時の処理
document.addEventListener('drop', e => e.preventDefault());
text.addEventListener('drop', (e) => {
    e.preventDefault(); // ブラウザがファイルを開くのを防ぐ
    text.classList.remove('dragover');

    // ファイル情報の取得
    const files = e.dataTransfer.files;
    if (files.length > 0) {
    const file = files[0];

    if (file.size > 1_000_000) {
        alert("ファイルが大きすぎます");
        return;
    }
    // ファイルの形式チェック（textファイルのみ）
    const isTxtExt = file.name.toLowerCase().endsWith('.txt');
    const isTextMime = file.type === '' || file.type === 'text/plain';
    if (!isTxtExt || !isTextMime) {
        alert("txtのみ対応しています");
        return;
    }
    if (file.type.indexOf('text') !== -1 || file.name.endsWith('.txt')) {
        const reader = new FileReader();

        // ファイル読み込みが完了した時の処理
        reader.onload = (event) => {
        // テキストエリアに内容を挿入
        text.value = event.target.result;
        };

        // ファイルをテキストとして読み込む
        reader.readAsText(file);
    } else {
        alert('テキストファイルをドロップしてください。');
    }
    //console.log(text);
    }
});

const clearBtn = document.getElementById('clearBtn');
clearBtn.addEventListener('click', () => {
    // 3. textareaの値を空にする
    text.value = '';
    return;
});

const downloadBtn = document.getElementById('downloadBtn');
downloadBtn.disabled = true;

function analyze() {
    const MAX_WORDS = 10000;

    const exclude = document.getElementById("exclude").value
    .split(",")
    .map(w => w.trim().toLowerCase());
    //余白を取って小文字にあわせて比較

    //入力バリデーション
    if (!text.value.trim()) {
    alert("入力してください");
    return;
    }
    //クレンジング、正規表現で文字列、数字をunicode指定してそれ以外は空白に置き換える
    const cleaned = text.value.replace(/[^\p{L}\p{N}]+/gu, " ");
    //単語ごとに分割、上限を1万件まで、メモリ節約
    const words = cleaned.split(" ").slice(0, MAX_WORDS);
    //除外とカウント
    const result = document.getElementById('result');

    loading.textContent = "処理中...";
    loading.classList.add('blink');
    result.innerHTML = "";
    setTimeout(() => {
    const counts = {};
    //1文字以上の単語を小文字統一で除外ワードと比較
    words.forEach(w => {
        const t = w.toLowerCase();
        if (w.length <= 1) return;
        if (exclude.includes(t)) return;
        //undefaind回避
        counts[t] = (counts[t] || 0) + 1;
    });
    //昇順でソート20件までメソッドチェーンで一括処理、テンプレートリテラルで見やすく少なく記述、conTextでXSS対策
    const fragment = document.createDocumentFragment();
    Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .forEach(([word, count]) => {
        const li = document.createElement("li");
        li.textContent = `${word} : ${count}`;
        fragment.appendChild(li);
        });
    //表示、fragmentを使ってDOMの描画回数を1回に
    result.appendChild(fragment);
    //単語が空の時
    if (Object.keys(counts).length === 0) {
        result.innerHTML = "単語が見つかりませんでした";
        downloadBtn.disabled = true;
        return;
    }
    downloadBtn.disabled = false;
    //CSVダウンロード用
    latestCounts = counts;
    //console.log(latestCounts);

    loading.textContent = "";
    loading.classList.remove('blink');
    }, 500);
};
//CSVダウンロード部分
document.getElementById('downloadBtn').addEventListener('click', () => {
    const rows = Object.entries(latestCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

    //出力データExcel数式対策
    const safeRows = rows
    .map(([word, count]) => {
        //演算子除去
        const safeWord = word.replace(/^[=+\-@]/, "'$&");
        return [safeWord, count];
    })
    .filter(([safeWord]) => safeWord.trim() !== "");

    //ヘッダー
    let csvOutput = "word,count\n";

    csvOutput += safeRows
    .map(([safeword, count]) => {
        return `"${safeword}",${count}`;
    }).join("\n");

    //データ互換性
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvOutput], { type: 'text/csv' });
    //ダウンロード
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    //メモリ開放
    URL.revokeObjectURL(url);
});