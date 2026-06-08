var timeout;
var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupMotionEngine() {
  if (!window.gsap || !window.ScrollTrigger) return null;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  if (prefersReducedMotion || !window.Lenis) return null;

  var lenis = new Lenis({
    lerp: 0.07,
    smoothWheel: true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1,
    infinite: false,
    autoRaf: false,
  });

  gsap.ticker.add(function (time) {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  lenis.on("scroll", ScrollTrigger.update);
  window.__lenis = lenis;

  return lenis;
}

function releaseHeroIntro() {
  if (window.gsap) {
    gsap.killTweensOf(".boundingtext, #heading, #chhoti-headings, #hero-intro");
    gsap.set(".boundingtext", { y: 0, clearProps: "transform" });
    gsap.set(["#heading", "#chhoti-headings", "#hero-intro"], {
      autoAlpha: 1,
      y: 0,
      clearProps: "transform,opacity,visibility",
    });
  }

  document.querySelectorAll(".boundingtext").forEach(function (item) {
    item.style.transform = "translateY(0)";
  });

  ["#hero-intro"].forEach(function (selector) {
    var item = document.querySelector(selector);
    if (item) {
      item.style.opacity = 1;
      item.style.transform = "translateY(0)";
    }
  });
}

function firstPageAnim() {
  if (prefersReducedMotion || !window.gsap) {
    releaseHeroIntro();
    return;
  }

  var tl = gsap.timeline();

  tl.from("#heading", {
      y: 30,
      opacity: 0,
      ease: "expo.out",
      duration: 1.1,
    })
    .from("#chhoti-headings", {
      y: 18,
      opacity: 0,
      ease: "expo.out",
      duration: 0.9,
      delay: -0.55,
    })
    .from("#hero-intro", {
      y: 18,
      opacity: 0,
      duration: 0.9,
      delay: -0.45,
      ease: "expo.out",
    });

  tl.eventCallback("onComplete", releaseHeroIntro);
  window.setTimeout(releaseHeroIntro, 1800);
}

function circleChaptaKaro() {
  var minicircle = document.querySelector("#minicircle");
  if (!minicircle || !window.gsap || window.matchMedia("(pointer: coarse)").matches) return;

  var xscale = 1;
  var yscale = 1;
  var xprev = 0;
  var yprev = 0;

  window.addEventListener("mousemove", function (dets) {
    clearTimeout(timeout);

    xscale = gsap.utils.clamp(0.8, 1.2, dets.clientX - xprev);
    yscale = gsap.utils.clamp(0.8, 1.2, dets.clientY - yprev);

    xprev = dets.clientX;
    yprev = dets.clientY;

    circleMouseFollower(xscale, yscale, dets.clientX, dets.clientY);

    timeout = setTimeout(function () {
      minicircle.style.transform =
        "translate(" + dets.clientX + "px, " + dets.clientY + "px) scale(1, 1)";
    }, 100);
  });
}

function circleMouseFollower(xscale, yscale, x, y) {
  var minicircle = document.querySelector("#minicircle");
  if (!minicircle) return;

  minicircle.style.transform =
    "translate(" + x + "px, " + y + "px) scale(" + xscale + ", " + yscale + ")";
}

function initProjectHoverImages() {
  if (!window.gsap) return;

  document.querySelectorAll(".elem").forEach(function (elem) {
    var rotate = 0;
    var diffrot = 0;
    var image = elem.querySelector("img");

    if (!image) return;

    elem.addEventListener("mouseleave", function () {
      gsap.to(image, {
        opacity: 0,
        scale: 0.96,
        ease: "power3.out",
        duration: 0.5,
        overwrite: "auto",
      });
    });

    elem.addEventListener("mousemove", function (dets) {
      var bounds = elem.getBoundingClientRect();
      var x = dets.clientX - bounds.left - image.offsetWidth / 2;
      var y = dets.clientY - bounds.top - image.offsetHeight / 2;
      diffrot = dets.clientX - rotate;
      rotate = dets.clientX;

      gsap.to(image, {
        opacity: 1,
        x: x,
        y: y,
        scale: 1,
        rotate: gsap.utils.clamp(-20, 20, diffrot * 0.5),
        ease: "power3.out",
        duration: 0.45,
        overwrite: "auto",
      });
    });
  });
}

function initCursorExpansion() {
  var minicircle = document.getElementById("minicircle");
  var text = document.getElementById("minicircle-text");
  if (!minicircle || !text) return;

  document.querySelectorAll(".elem").forEach(function (elem) {
    elem.addEventListener("mouseenter", function () {
      minicircle.style.width = "100px";
      minicircle.style.height = "100px";
      minicircle.style.opacity = 1;
      text.style.display = "revert";
    });

    elem.addEventListener("mouseleave", function () {
      minicircle.style.width = "15px";
      minicircle.style.height = "15px";
      minicircle.style.opacity = 0.5;
      text.style.display = "none";
    });
  });
}

async function initReveal() {
  if (!window.gsap) {
    document.querySelectorAll("[data-reveal]").forEach(function (item) {
      item.style.opacity = 1;
      item.style.visibility = "visible";
    });
    return;
  }

  var els = gsap.utils.toArray("[data-reveal]");
  if (!els.length) {
    return;
  }

  if (prefersReducedMotion || !window.ScrollTrigger) {
    gsap.set(els, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      clipPath: "inset(0% 0% 0% 0%)",
      clearProps: "willChange",
    });
    return;
  }

  if (document.fonts) {
    await document.fonts.ready;
  }

  els.forEach(function (el) {
    var direction = el.dataset.revealDirection;
    var initial = {
      autoAlpha: 0,
      y: 28,
      x: 0,
      filter: "blur(0px)",
      clipPath: "inset(0% 0% 0% 0%)",
      force3D: true,
      willChange: "transform, opacity, filter",
    };

    if (direction === "left") {
      initial.x = -38;
      initial.y = 0;
    }

    if (direction === "clip") {
      initial.y = 0;
      initial.clipPath = "inset(0% 0% 100% 0%)";
    }

    if (direction === "blur") {
      initial.y = 18;
      initial.filter = "blur(10px)";
    }

    gsap.set(el, initial);
  });

  ScrollTrigger.batch(els, {
    start: "top 82%",
    once: true,
    batchMax: 5,
    onEnter: function (batch) {
      batch.forEach(function (el) {
        el.style.willChange = "transform, opacity";
      });

      gsap.to(batch, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1,
        ease: "power4.out",
        stagger: { each: 0.075, grid: "auto" },
        overwrite: true,
        onComplete: function () {
          batch.forEach(function (el) {
            el.style.willChange = "auto";
          });
        },
      });
    },
  });

  ScrollTrigger.refresh();
  revealAlreadyInView(els);

  document.querySelectorAll("img[loading='lazy']").forEach(function (img) {
    if (img.complete) return;
    img.addEventListener("load", function () {
      ScrollTrigger.refresh();
    }, { once: true });
    img.addEventListener("error", function () {
      ScrollTrigger.refresh();
    }, { once: true });
  });

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
    revealAlreadyInView(els);
  }, { once: true });
}

function revealAlreadyInView(els) {
  if (!window.gsap) return;

  els.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    var inView = rect.top < window.innerHeight * 0.82 && rect.bottom > 0;

    if (!inView) return;

    gsap.to(el, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.72,
      ease: "power4.out",
      overwrite: true,
      onComplete: function () {
        el.style.willChange = "auto";
      },
    });
  });
}

function isElementInRevealRange(el, range) {
  var rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * range && rect.bottom > 0;
}

function releaseVisibleMotion() {
  if (!window.gsap) return;

  var revealEls = gsap.utils.toArray("[data-reveal]");
  revealAlreadyInView(revealEls);

  gsap.utils.toArray("[data-letter-reveal]").forEach(function (el) {
    if (!isElementInRevealRange(el, 0.88)) return;

    var chars = el.querySelectorAll(".letter-reveal-char");
    if (!chars.length) return;

    if (el.__letterTween && el.__letterTween.progress() < 1) {
      el.__letterTween.play(0);
      return;
    }

    gsap.set(chars, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
    });
  });

  if (window.ScrollTrigger) {
    ScrollTrigger.refresh();
  }
}

async function initTextClipReveal() {
  if (!window.gsap) return;

  var textEls = gsap.utils.toArray("[data-text-reveal]");
  if (!textEls.length) return;

  if (prefersReducedMotion || !window.ScrollTrigger) {
    gsap.set(textEls, { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" });
    return;
  }

  if (document.fonts) {
    await document.fonts.ready;
  }

  textEls.forEach(function (el) {
    gsap.set(el, {
      autoAlpha: 0,
      y: 42,
      clipPath: "inset(0% 0% 100% 0%)",
      force3D: true,
    });

    gsap.to(el, {
      autoAlpha: 1,
      y: 0,
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.05,
      ease: "power4.out",
      overwrite: "auto",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
      },
      onStart: function () {
        el.style.willChange = "transform, opacity, clip-path";
      },
      onComplete: function () {
        el.style.willChange = "auto";
      },
    });
  });

  ScrollTrigger.refresh();
}

async function initLetterBlurReveal() {
  var letterEls = Array.prototype.slice.call(document.querySelectorAll("[data-letter-reveal]"));
  if (!letterEls.length) return;

  if (document.fonts) {
    await document.fonts.ready;
  }

  letterEls.forEach(function (el) {
    var text = el.textContent.trim();
    if (!text) return;

    el.setAttribute("aria-label", text);
    el.innerHTML = "";

    text.split("").forEach(function (char) {
      var span = document.createElement("span");
      span.className = "letter-reveal-char";
      span.setAttribute("aria-hidden", "true");
      if (char === " ") {
        span.className += " letter-space";
        span.textContent = " ";
      } else {
        span.textContent = char;
      }
      el.appendChild(span);
    });

    var chars = el.querySelectorAll(".letter-reveal-char");
    syncLetterGradient(el, chars);

    if (!window.gsap || prefersReducedMotion || !window.ScrollTrigger) {
      chars.forEach(function (char) {
        char.style.opacity = 1;
        char.style.visibility = "visible";
        char.style.transform = "none";
        char.style.filter = "none";
      });
      return;
    }

    var isProcess = el.dataset.letterReveal === "process";

    gsap.set(chars, {
      autoAlpha: 0,
      x: function (index) {
        return isProcess ? (index % 2 === 0 ? -10 : 10) : 0;
      },
      y: isProcess ? 18 : 34,
      filter: isProcess ? "blur(7px)" : "blur(12px)",
      force3D: true,
    });

    var tween = gsap.to(chars, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      duration: isProcess ? 0.68 : 0.86,
      ease: "power4.out",
      stagger: isProcess ? 0.012 : 0.018,
      scrollTrigger: {
        trigger: el,
        start: isProcess ? "top 78%" : "top 76%",
        once: true,
      },
      onStart: function () {
        el.style.willChange = "transform, opacity, filter";
      },
      onComplete: function () {
        el.style.willChange = "auto";
      },
    });

    el.__letterTween = tween;

    if (isElementInRevealRange(el, 0.84)) {
      tween.scrollTrigger.disable(false);
      tween.play(0);
    }
  });

  ScrollTrigger.refresh();

  window.addEventListener("resize", function () {
    letterEls.forEach(function (el) {
      syncLetterGradient(el, el.querySelectorAll(".letter-reveal-char"));
    });
  }, { once: true });
}

function syncLetterGradient(el, chars) {
  if (!chars.length) return;

  var parentRect = el.getBoundingClientRect();
  var width = Math.max(parentRect.width, 1);

  chars.forEach(function (char) {
    var rect = char.getBoundingClientRect();
    var x = rect.left - parentRect.left;

    char.style.backgroundSize = width + "px 100%";
    char.style.backgroundPosition = -x + "px 0";
  });
}

function initMetricCounters() {
  if (!window.gsap) return;

  var counters = gsap.utils.toArray("[data-count]");
  if (!counters.length) return;

  counters.forEach(function (el) {
    var target = parseFloat(el.dataset.count || "0");
    var decimals = parseInt(el.dataset.decimals || "0", 10);
    var suffix = el.dataset.suffix || "";
    var state = { value: 0 };

    function render(value) {
      el.textContent = value.toFixed(decimals) + suffix;
    }

    if (prefersReducedMotion || !window.ScrollTrigger) {
      render(target);
      return;
    }

    render(0);

    gsap.to(state, {
      value: target,
      duration: 1.45,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".metrics",
        start: "top 75%",
        once: true,
      },
      onUpdate: function () {
        render(state.value);
      },
    });
  });
}

function initSectionTextSequences() {
  if (!window.gsap) return;

  var groups = gsap.utils.toArray(".service-card, .process-list > div");
  if (!groups.length) return;

  groups.forEach(function (group) {
    var pieces = group.querySelectorAll("span, h3, p, small");
    if (!pieces.length) return;

    if (prefersReducedMotion || !window.ScrollTrigger) {
      gsap.set(pieces, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
      return;
    }

    gsap.set(pieces, {
      autoAlpha: 0,
      y: 18,
      filter: "blur(8px)",
      force3D: true,
    });

    gsap.to(pieces, {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.72,
      ease: "power4.out",
      stagger: 0.075,
      scrollTrigger: {
        trigger: group,
        start: "top 78%",
        once: true,
      },
      onStart: function () {
        group.style.willChange = "transform, opacity";
      },
      onComplete: function () {
        group.style.willChange = "auto";
      },
    });
  });

  ScrollTrigger.refresh();
}

function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      if (window.__lenis && !prefersReducedMotion) {
        window.__lenis.scrollTo(target, {
          offset: -80,
          duration: 1.25,
          easing: function (t) {
            return Math.min(1, 1.001 - Math.pow(2, -10 * t));
          },
        });
        return;
      }

      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });
}

function setTheme(theme) {
  var resolvedTheme = theme === "light" ? "light" : "dark";
  var button = document.querySelector(".theme-toggle");
  var icon = button ? button.querySelector("i") : null;
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  document.body.dataset.theme = resolvedTheme;

  if (button) {
    var isLight = resolvedTheme === "light";
    button.setAttribute("aria-pressed", String(isLight));
    button.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
  }

  if (icon) {
    icon.className = resolvedTheme === "light" ? "fa-solid fa-moon" : "fa-solid fa-sun";
  }

  if (themeMeta) {
    themeMeta.setAttribute("content", resolvedTheme === "light" ? "#f2eee7" : "#050403");
  }

  try {
    localStorage.setItem("vanta-theme", resolvedTheme);
  } catch (error) {
    return;
  }
}

function initThemeToggle() {
  var button = document.querySelector(".theme-toggle");
  var savedTheme = "light";

  try {
    savedTheme = localStorage.getItem("vanta-theme") || "light";
  } catch (error) {
    savedTheme = "light";
  }

  setTheme(savedTheme);

  if (!button) return;

  button.addEventListener("click", function () {
    var nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
    setTheme(nextTheme);

    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  });
}

function initNavAutoVisibility() {
  var nav = document.getElementById("nav");
  var themeToggle = document.querySelector(".site-theme-toggle");
  if (!nav || !window.ScrollTrigger || prefersReducedMotion) return;

  function setVisible(isVisible) {
    nav.classList.toggle("nav-hidden", !isVisible);
    if (themeToggle) {
      themeToggle.classList.toggle("nav-hidden", !isVisible);
    }
  }

  setVisible(false);

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: function (self) {
      if (self.scroll() > 80 && self.direction < 0) {
        setVisible(true);
        return;
      }

      setVisible(false);
    },
  });
}

function getCurrentTime() {
  var time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  var timeEl = document.getElementById("time");
  if (timeEl) timeEl.innerHTML = time;
}

document.addEventListener("DOMContentLoaded", function () {
  setupMotionEngine();
  initThemeToggle();
  initNavAutoVisibility();
  firstPageAnim();
  circleChaptaKaro();
  initProjectHoverImages();
  initCursorExpansion();
  initSmoothAnchors();
  initReveal();
  initTextClipReveal();
  initLetterBlurReveal();
  initMetricCounters();
  initSectionTextSequences();
  window.setTimeout(releaseVisibleMotion, 120);
  window.setTimeout(releaseVisibleMotion, 420);
  window.addEventListener("hashchange", function () {
    window.setTimeout(releaseVisibleMotion, 120);
  });
  getCurrentTime();
  window.setInterval(getCurrentTime, 30000);
});
