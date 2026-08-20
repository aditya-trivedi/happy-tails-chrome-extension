(function () {
  if (window.Pawsome && window.Pawsome.createPet) return;

  window.Pawsome = window.Pawsome || {};

  const W = 78;
  const DOUBLE_MS = 280;

  const GAITS = {
    slow: { speed: [55, 85], span: [80, 200], weight: 3 },
    normal: { speed: [110, 160], span: [120, 320], weight: 4 },
    excited: { speed: [220, 320], span: [180, 480], weight: 2 },
  };

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function randRange([min, max]) {
    return min + Math.random() * (max - min);
  }

  function pickGait() {
    const entries = Object.entries(GAITS);
    const total = entries.reduce((s, [, g]) => s + g.weight, 0);
    let r = Math.random() * total;
    for (const [name, g] of entries) {
      r -= g.weight;
      if (r <= 0) return name;
    }
    return "normal";
  }

  function createPet(options) {
    const opts = options || {};
    const host = opts.root;
    const art = window.Pawsome;
    const species = "dog";
    const breed = art.normalizeBreed ? art.normalizeBreed(opts.breed) : "classic";
    const svgMarkup =
      opts.svg || (art.svgForCompanion ? art.svgForCompanion(species, breed) : art.DOG_SVG);
    const defaultMouth =
      (art.mouthForCompanion && art.mouthForCompanion(species, breed)) ||
      (art.MOUTH && art.MOUTH[breed]) ||
      art.MOUTH.dog;
    const mouthPaths = Object.assign({}, defaultMouth, opts.mouthPaths || {});

    const pet = document.createElement("div");
    pet.className = ["pawsome-pet", "pawsome-idle", "pawsome-calm", "pawsome-dog", `pawsome-${breed}`].join(" ");
    pet.setAttribute("role", "img");
    const label =
      breed === "golden"
        ? "Pawsome golden retriever companion"
        : breed === "dachshund"
          ? "Pawsome dachshund companion"
          : breed === "husky"
            ? "Pawsome husky companion"
            : breed === "labrador"
              ? "Pawsome black labrador companion"
              : breed === "shepherd"
                ? "Pawsome German shepherd companion"
                : "Pawsome dog companion";
    pet.setAttribute("aria-label", label);
    pet.style.setProperty("--pawsome-phase", `-${(Math.random() * 2.4).toFixed(2)}s`);
    pet.innerHTML = svgMarkup;
    if (!pet.querySelector(".pawsome-figure")) {
      pet.innerHTML = art.DOG_SVG;
    }

    const treat = document.createElement("div");
    treat.className = "pawsome-treat";

    host.appendChild(pet);
    host.appendChild(treat);

    const pupilL = pet.querySelector(".pawsome-pupil-left");
    const pupilR = pet.querySelector(".pawsome-pupil-right");
    const mouth = pet.querySelector(".pawsome-mouth");

    let destroyed = false;
    let busy = false;
    let facingRight = true;
    let posX = 0;
    let lastClickAt = 0;
    let clickTimer = null;
    let lookOverrideUntil = 0;
    let excitedUntil = 0;
    let scrollPeekTimer = null;
    const intervals = [];

    function minX() {
      return window.innerWidth * 0.1;
    }

    function maxX() {
      const w = pet.getBoundingClientRect().width || W;
      return Math.max(minX(), window.innerWidth * 0.9 - w);
    }

    function setPos(x) {
      posX = clamp(x, minX(), maxX());
      pet.style.left = `${posX}px`;
    }

    function setFacing(right) {
      facingRight = !!right;
      pet.classList.toggle("pawsome-flip", !facingRight);
    }

    function setExcited(ms) {
      excitedUntil = Date.now() + ms;
      pet.classList.add("pawsome-excited");
      pet.classList.remove("pawsome-calm");
    }

    function refreshTailMood() {
      if (destroyed) return;
      if (Date.now() < excitedUntil || busy) {
        pet.classList.add("pawsome-excited");
        pet.classList.remove("pawsome-calm");
      } else {
        pet.classList.add("pawsome-calm");
        pet.classList.remove("pawsome-excited");
      }
    }

    function clearActionClasses() {
      pet.classList.remove(
        "pawsome-hop",
        "pawsome-roll",
        "pawsome-paw",
        "pawsome-stretch",
        "pawsome-chew",
        "pawsome-walk",
        "pawsome-walk-slow",
        "pawsome-walk-normal",
        "pawsome-walk-excited",
        "pawsome-blink",
        "pawsome-peek",
        "pawsome-look-left",
        "pawsome-look-right",
        "pawsome-ear-twitch-left",
        "pawsome-ear-twitch-right"
      );
      if (mouth) mouth.setAttribute("d", mouthPaths.idle);
    }

    async function withBusy(fn) {
      if (destroyed || busy) return false;
      busy = true;
      pet.classList.add("pawsome-busy");
      pet.classList.remove("pawsome-idle");
      try {
        await fn();
      } finally {
        busy = false;
        if (!destroyed) {
          clearActionClasses();
          pet.classList.remove("pawsome-busy");
          pet.classList.add("pawsome-idle");
          refreshTailMood();
        }
      }
      return true;
    }

    function playClass(name, ms) {
      return withBusy(async () => {
        pet.classList.add(name);
        setExcited(ms + 400);
        await wait(ms);
      });
    }

    function givePaw() {
      return withBusy(async () => {
        pet.classList.add("pawsome-paw");
        setExcited(1400);
        await wait(1000);
      });
    }

    async function blink() {
      if (destroyed || busy) return;
      pet.classList.add("pawsome-blink");
      await wait(200);
      if (destroyed) return;
      pet.classList.remove("pawsome-blink");
    }

    async function earTwitch() {
      if (destroyed || busy) return;
      const cls = Math.random() < 0.5 ? "pawsome-ear-twitch-left" : "pawsome-ear-twitch-right";
      pet.classList.add(cls);
      await wait(300);
      if (destroyed) return;
      pet.classList.remove(cls);
    }

    async function lookAround() {
      if (destroyed || busy || Date.now() < lookOverrideUntil) return;
      await withBusy(async () => {
        pet.classList.add("pawsome-look-left");
        await wait(550);
        if (destroyed) return;
        pet.classList.remove("pawsome-look-left");
        pet.classList.add("pawsome-look-right");
        await wait(550);
        if (destroyed) return;
        pet.classList.remove("pawsome-look-right");
        await wait(200);
      });
    }

    async function stretchYawn() {
      await withBusy(async () => {
        pet.classList.add("pawsome-stretch");
        if (mouth) mouth.setAttribute("d", mouthPaths.yawn);
        await wait(1400);
        if (destroyed) return;
        if (mouth) mouth.setAttribute("d", mouthPaths.idle);
        await wait(600);
      });
    }

    function updateEyes(clientX, clientY) {
      if (destroyed || !pupilL || !pupilR || busy) return;
      const rect = pet.getBoundingClientRect();
      const cx = rect.left + rect.width * (facingRight ? 0.62 : 0.4);
      const cy = rect.top + rect.height * 0.32;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const max = 2.3;
      const ox = (dx / dist) * Math.min(max, dist / 36);
      const oy = (dy / dist) * Math.min(max, dist / 36);
      const localX = facingRight ? ox : -ox;
      pupilL.setAttribute("transform", `translate(${localX} ${oy})`);
      pupilR.setAttribute("transform", `translate(${localX} ${oy})`);
    }

    function peekFromScroll() {
      if (destroyed || busy) return;
      lookOverrideUntil = Date.now() + 900;
      pet.classList.remove("pawsome-look-left", "pawsome-look-right");
      pet.classList.add("pawsome-peek");
      setExcited(700);
      clearTimeout(scrollPeekTimer);
      scrollPeekTimer = setTimeout(() => pet.classList.remove("pawsome-peek"), 700);
    }

    function walkTo(targetX, speedPxPerSec = 140, gait = "normal") {
      return withBusy(async () => {
        const start = posX;
        const dist = targetX - start;
        if (Math.abs(dist) < 4) return;
        setFacing(dist > 0);
        pet.classList.remove("pawsome-walk-slow", "pawsome-walk-normal", "pawsome-walk-excited");
        pet.classList.add("pawsome-walk", `pawsome-walk-${gait}`);
        if (gait === "excited") {
          setExcited(Math.max(800, (Math.abs(dist) / speedPxPerSec) * 1000 + 400));
        } else if (gait === "normal") {
          setExcited(400);
        }
        const duration = (Math.abs(dist) / speedPxPerSec) * 1000;
        const t0 = performance.now();
        await new Promise((resolve) => {
          function step(now) {
            if (destroyed) {
              resolve();
              return;
            }
            const t = clamp((now - t0) / duration, 0, 1);
            const eased =
              gait === "excited"
                ? t
                : t < 0.5
                  ? 2 * t * t
                  : 1 - Math.pow(-2 * t + 2, 2) / 2;
            setPos(start + dist * eased);
            if (t < 1) requestAnimationFrame(step);
            else resolve();
          }
          requestAnimationFrame(step);
        });
        if (destroyed) return;
        pet.classList.remove("pawsome-walk", "pawsome-walk-slow", "pawsome-walk-normal", "pawsome-walk-excited");
      });
    }

    async function roamOnce() {
      if (destroyed || busy) return false;
      const gait = pickGait();
      const cfg = GAITS[gait];
      let target = null;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const span = randRange(cfg.span);
        const dir = Math.random() < 0.5 ? -1 : 1;
        let candidate = posX + dir * span;
        if (candidate < minX() || candidate > maxX()) candidate = posX - dir * span;
        candidate = clamp(candidate, minX(), maxX());
        if (Math.abs(candidate - posX) < 40) continue;
        target = candidate;
        break;
      }
      if (target === null) return false;
      return walkTo(target, randRange(cfg.speed), gait);
    }

    async function scheduleRoam() {
      while (!destroyed) {
        await wait(1400 + Math.random() * 4200);
        if (destroyed) return;
        if (!busy) {
          await roamOnce();
          if (!destroyed && !busy && Math.random() < 0.28) {
            await wait(300 + Math.random() * 700);
            if (!destroyed && !busy) await roamOnce();
          }
        }
      }
    }

    async function feedTreat() {
      await withBusy(async () => {
        setExcited(2000);
        const rect = pet.getBoundingClientRect();
        treat.style.left = `${rect.left + (facingRight ? rect.width - 34 : 18)}px`;
        treat.style.top = `${rect.top + 16}px`;
        treat.classList.remove("pawsome-treat-show");
        void treat.offsetWidth;
        treat.classList.add("pawsome-treat-show");
        await wait(700);
        if (destroyed) return;
        pet.classList.add("pawsome-chew");
        if (mouth) mouth.setAttribute("d", mouthPaths.chew);
        await wait(1700);
        if (destroyed) return;
        treat.classList.remove("pawsome-treat-show");
        if (mouth) mouth.setAttribute("d", mouthPaths.idle);
      });
    }

    async function onPetClick(e) {
      e.preventDefault();
      e.stopPropagation();
      if (destroyed) return;
      if (e.shiftKey) {
        lastClickAt = 0;
        await feedTreat();
        return;
      }
      const now = Date.now();
      if (now - lastClickAt < DOUBLE_MS) {
        lastClickAt = 0;
        clearTimeout(clickTimer);
        await playClass("pawsome-roll", 1100);
        return;
      }
      lastClickAt = now;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(async () => {
        lastClickAt = 0;
        await givePaw();
      }, DOUBLE_MS);
    }

    const idleActions = [
      { fn: blink, weight: 4, minGap: 2800 },
      { fn: earTwitch, weight: 3, minGap: 3200 },
      { fn: lookAround, weight: 2, minGap: 8000 },
      { fn: stretchYawn, weight: 1, minGap: 24000 },
    ];
    const lastRan = Object.fromEntries(idleActions.map((a) => [a.fn.name, 0]));

    async function tickIdle() {
      if (destroyed || busy) return;
      const now = Date.now();
      const pool = idleActions.filter((a) => now - lastRan[a.fn.name] > a.minGap);
      if (!pool.length) return;
      const total = pool.reduce((s, a) => s + a.weight, 0);
      let r = Math.random() * total;
      let pick = pool[0];
      for (const a of pool) {
        r -= a.weight;
        if (r <= 0) {
          pick = a;
          break;
        }
      }
      lastRan[pick.fn.name] = now;
      await pick.fn();
    }

    const api = {
      el: pet,
      species,
      breed,
      onPointerMove(clientX, clientY) {
        if (destroyed) return;
        lookOverrideUntil = Date.now() + 400;
        pet.classList.remove("pawsome-look-left", "pawsome-look-right", "pawsome-peek");
        updateEyes(clientX, clientY);
      },
      onScrollBurst() {
        peekFromScroll();
      },
      onResize() {
        if (!destroyed) setPos(posX);
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        intervals.forEach(clearInterval);
        intervals.length = 0;
        clearTimeout(clickTimer);
        clearTimeout(scrollPeekTimer);
        pet.removeEventListener("click", onPetClick);
        pet.remove();
        treat.remove();
      },
    };

    setPos(typeof opts.startX === "number" ? opts.startX : minX() + Math.random() * Math.max(0, maxX() - minX()));
    setFacing(Math.random() < 0.5);
    pet.addEventListener("click", onPetClick);

    intervals.push(setInterval(tickIdle, 1600));
    intervals.push(setInterval(refreshTailMood, 400));

    setTimeout(() => {
      if (!destroyed && !busy) playClass("pawsome-hop", 550);
    }, 400 + Math.random() * 600);

    if (opts.roam !== false) {
      setTimeout(() => scheduleRoam(), 1200 + Math.random() * 1600);
    }

    return api;
  }

  window.Pawsome.createPet = createPet;
})();
