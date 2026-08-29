/* =============================================================
   K.seq - 共通JavaScript
   -------------------------------------------------------------
   ■ このファイルの役割
     スマートフォン用の「ハンバーガーメニュー」の開閉だけを
     担当しています。ページの表示に必須ではありませんが、
     スマホでのナビゲーション操作に使います。

     ※ 難しい処理は入れていません。将来ここに機能を追加する
        場合も、この下に追記していく形で拡張できます。
   ============================================================= */

(function () {
  "use strict";

  // ページの読み込みが終わってから実行する
  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".global-nav");

    if (!toggle || !nav) {
      return; // 要素が無ければ何もしない
    }

    // --- メニューを開く／閉じる ---
    function setOpen(isOpen) {
      nav.setAttribute("data-open", isOpen ? "true" : "false");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      // 開いている間は背面のスクロールを止める
      document.body.style.overflow = isOpen ? "hidden" : "";
    }

    // ハンバーガーボタンのクリックで開閉を切り替え
    toggle.addEventListener("click", function () {
      var isOpen = nav.getAttribute("data-open") === "true";
      setOpen(!isOpen);
    });

    // メニュー内のリンクを押したら閉じる
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setOpen(false);
      }
    });

    // Escキーで閉じる（アクセシビリティ）
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });

    // 画面幅がPCサイズに戻ったら状態をリセット
    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) {
        setOpen(false);
      }
    });
  });
})();
