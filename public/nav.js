// Shared navigation behavior for all Oson Farm pages:
// sticky bar on scroll, current-page highlight, and the mobile hamburger menu
// (oson.css hides the nav list under 768px and expects this button to exist).
(function () {
  function init() {
    var nav = document.querySelector("nav");
    if (!nav) return;

    // sticky shadow once the page is scrolled
    window.addEventListener("scroll", function () {
      if (window.scrollY > 100) nav.classList.add("sticky");
      else nav.classList.remove("sticky");
    });

    // highlight the link for the page we are on
    var currentPage = window.location.pathname.split("/").pop() || "index.html";
    nav.querySelectorAll("a").forEach(function (link) {
      if (link.getAttribute("href") === currentPage) link.classList.add("active");
    });

    // mobile hamburger (skip if script.js already created one)
    if (!nav.querySelector(".mobile-menu-btn")) {
      var btn = document.createElement("button");
      btn.className = "mobile-menu-btn";
      btn.setAttribute("aria-label", "Open menu");
      btn.innerHTML = "<span></span><span></span><span></span>";
      nav.appendChild(btn);
      btn.addEventListener("click", function () {
        nav.classList.toggle("mobile-open");
      });
      document.addEventListener("click", function (e) {
        if (!nav.contains(e.target)) nav.classList.remove("mobile-open");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
