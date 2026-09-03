/* =============================================================
   K.seq - 共通JavaScript
   -------------------------------------------------------------
   ■ このファイルの役割
     1. スマホ／タブレット用ハンバーガーメニューの開閉
     2. ヘッダーナビのページ内スムーズスクロール（アンカー移動）
     3. スクロール時の上品なフェードアップ表示（IntersectionObserver）
     4. ヘッダーのスクロール状態切り替え（影・背景）

     ※ 外部ライブラリは使用していません。
        アニメーションは CSS の transform / opacity のみで行い、
        「動きを控える」設定（prefers-reduced-motion）の端末では
        自動的に無効化されます。JavaScript が無効でも、内容は
        すべて表示されます（先に隠すのは JS が動く時だけ）。
   ============================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".global-nav");

    /* --- メニューの開閉（ドロワー） --- */
    function setOpen(isOpen) {
      if (!nav || !toggle) return;
      nav.setAttribute("data-open", isOpen ? "true" : "false");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      // 開いている間は背面のスクロールを止める
      document.body.style.overflow = isOpen ? "hidden" : "";
    }

    /* =========================================================
       1. ハンバーガーメニュー
       ========================================================= */
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var isOpen = nav.getAttribute("data-open") === "true";
        setOpen(!isOpen);
      });

      // Escキーで閉じる（アクセシビリティ）
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") setOpen(false);
      });

      // 画面幅が広がってナビが横並びに戻ったら状態をリセット
      window.addEventListener("resize", function () {
        if (window.innerWidth > 1080) setOpen(false);
      });
    }

    /* =========================================================
       2. ヘッダーナビのページ内スムーズスクロール
       -----------------------------------------------------------
       ・同じページ内に対象セクションがある場合はスムーズスクロール
         （固定ヘッダー分の余白は CSS の scroll-margin-top で調整）
       ・対象が無い場合（下層ページ → index.html#xxx）は通常遷移
       ・メニュー内のリンクを押したら自動でメニューを閉じる
       ========================================================= */
    if (nav) {
      nav.addEventListener("click", function (event) {
        var link = event.target.closest("a");
        if (!link) return;

        var href = link.getAttribute("href") || "";
        var hashIndex = href.indexOf("#");

        // ハッシュを含まないリンクは通常動作（メニューだけ閉じる）
        if (hashIndex === -1) { setOpen(false); return; }

        var id = href.slice(hashIndex + 1);
        var target = id ? document.getElementById(id) : null;

        // このページに対象が無ければ通常遷移（例：下層ページ→トップの各セクション）
        if (!target) { setOpen(false); return; }

        // 同一ページ内：スムーズスクロール
        event.preventDefault();
        setOpen(false);

        var behavior = prefersReduced ? "auto" : "smooth";
        if (id === "top") {
          window.scrollTo({ top: 0, behavior: behavior });
        } else {
          target.scrollIntoView({ behavior: behavior, block: "start" });
        }

        // URL のハッシュを更新（ページ位置は動かさない）
        if (window.history && history.pushState) {
          history.pushState(null, "", "#" + id);
        }
      });
    }

    /* =========================================================
       3. ヘッダーのスクロール状態（影・背景をわずかに変化）
       ========================================================= */
    var header = document.querySelector(".site-header");
    if (header) {
      var onScroll = function () {
        if (window.scrollY > 8) header.classList.add("is-scrolled");
        else header.classList.remove("is-scrolled");
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* =========================================================
       4. スクロールで順番にフェードアップ（IntersectionObserver）
       ========================================================= */
    if (prefersReduced || !("IntersectionObserver" in window)) {
      // 動きを付けない：内容はそのまま表示
      document.documentElement.classList.remove("js-anim");
      return;
    }

    document.documentElement.classList.add("js-anim");

    var STAGGER = 90; // 要素ごとの遅延（ミリ秒）

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          el.classList.add("is-visible");

          if (el.hasAttribute("data-stagger")) {
            var kids = el.querySelectorAll(":scope > .reveal");
            kids.forEach(function (kid, i) {
              kid.style.transitionDelay = i * STAGGER + "ms";
              kid.classList.add("is-visible");
            });
          }
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      observer.observe(group);
    });
    document.querySelectorAll(".reveal").forEach(function (el) {
      if (el.closest("[data-stagger]")) return;
      observer.observe(el);
    });
  });
})();
