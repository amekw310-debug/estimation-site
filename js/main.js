/* =============================================================
   K.seq - 共通JavaScript
   -------------------------------------------------------------
   ■ このファイルの役割
     1. スマホ用ハンバーガーメニューの開閉
     2. スクロール時の上品なフェードアップ表示（IntersectionObserver）
     3. ヘッダーのスクロール状態切り替え（影・背景）

     ※ 外部ライブラリは使用していません。
        アニメーションは CSS の transform / opacity のみで行い、
        「動きを控える」設定（prefers-reduced-motion）の端末では
        自動的に無効化されます。JavaScript が無効でも、内容は
        すべて表示されます（先に隠すのは JS が動く時だけ）。
   ============================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       1. ハンバーガーメニュー
       ========================================================= */
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".global-nav");

    if (toggle && nav) {
      var setOpen = function (isOpen) {
        nav.setAttribute("data-open", isOpen ? "true" : "false");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        document.body.style.overflow = isOpen ? "hidden" : "";
      };

      toggle.addEventListener("click", function () {
        var isOpen = nav.getAttribute("data-open") === "true";
        setOpen(!isOpen);
      });

      nav.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
          setOpen(false);
        }
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          setOpen(false);
        }
      });

      window.addEventListener("resize", function () {
        if (window.innerWidth > 768) {
          setOpen(false);
        }
      });
    }

    /* =========================================================
       2. ヘッダーのスクロール状態（影・背景をわずかに変化）
       ========================================================= */
    var header = document.querySelector(".site-header");
    if (header) {
      var onScroll = function () {
        if (window.scrollY > 8) {
          header.classList.add("is-scrolled");
        } else {
          header.classList.remove("is-scrolled");
        }
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* =========================================================
       3. スクロールで順番にフェードアップ（IntersectionObserver）
       -----------------------------------------------------------
       ・prefers-reduced-motion / 未対応ブラウザの場合は何もしません
         （<head> の小さなスクリプトが .js-anim を付けないため、
          要素は初めから表示されたままになります）。
       ・一度表示した要素は unobserve し、再アニメーションしません。
       ========================================================= */
    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      // 動きを付けない：内容はそのまま表示（.js-anim が付いていても保険で解除）
      document.documentElement.classList.remove("js-anim");
      return;
    }

    // 保険：JS がここまで来たら .js-anim を確実に付ける
    document.documentElement.classList.add("js-anim");

    var STAGGER = 90; // 要素ごとの遅延（ミリ秒）

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          el.classList.add("is-visible");

          // グループ（data-stagger）は直下の .reveal を順番に表示
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

    // グループを監視（直下の .reveal はグループ経由で表示）
    var groups = document.querySelectorAll("[data-stagger]");
    groups.forEach(function (group) {
      observer.observe(group);
    });

    // 単独の .reveal（グループに属さないもの）を監視
    var singles = document.querySelectorAll(".reveal");
    singles.forEach(function (el) {
      if (el.closest("[data-stagger]")) return; // グループが担当
      observer.observe(el);
    });
  });
})();
