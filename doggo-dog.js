
(function () {
  if (window.DoggoDog) return;

  const W = 115;
  const DOUBLE_MS = 280;

  const MOUTH = {
    idle: "M50 38 Q56 42 62 38",
    yawn: "M48 37 Q56 52 64 37",
    chew: "M50 38 Q56 46 62 38",
  };

  const DEFAULT_SVG = `
    <svg viewBox="0 0 96 67" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g class="doggo-stage">
        <g class="doggo-figure">
          <ellipse class="doggo-tail" cx="12" cy="40" rx="11" ry="4.5" fill="#C68642"/>
          <ellipse class="doggo-body" cx="44" cy="46" rx="24" ry="15" fill="#E0A86A"/>
          <ellipse cx="34" cy="48" rx="5" ry="4" fill="#C68642" opacity="0.45"/>
          <ellipse class="doggo-leg doggo-leg-back" cx="32" cy="58" rx="5.5" ry="8" fill="#C68642"/>
          <ellipse class="doggo-leg doggo-leg-front doggo-paw-leg" cx="56" cy="58" rx="5.5" ry="8" fill="#C68642"/>
          <g class="doggo-head">
            <g class="doggo-ear doggo-ear-left">
              <ellipse cx="40" cy="16" rx="7" ry="11" fill="#C68642"/>
              <ellipse cx="41" cy="17" rx="3.2" ry="6" fill="#E8B48A"/>
            </g>
            <g class="doggo-ear doggo-ear-right">
              <ellipse cx="70" cy="16" rx="7" ry="11" fill="#C68642"/>
              <ellipse cx="69" cy="17" rx="3.2" ry="6" fill="#E8B48A"/>
            </g>
            <circle cx="56" cy="28" r="15" fill="#E0A86A"/>
            <ellipse cx="56" cy="34" rx="9" ry="6.5" fill="#F0D0B0"/>
            <circle class="doggo-eye-white" cx="50" cy="26" r="3.6" fill="#FFF8F0"/>
            <circle class="doggo-eye-white" cx="62" cy="26" r="3.6" fill="#FFF8F0"/>
            <circle class="doggo-pupil doggo-pupil-left" cx="50" cy="26" r="1.7" fill="#2D1B0E"/>
            <circle class="doggo-pupil doggo-pupil-right" cx="62" cy="26" r="1.7" fill="#2D1B0E"/>
            <ellipse class="doggo-eyelid doggo-eyelid-left" cx="50" cy="26" rx="3.8" ry="3.8" fill="#E0A86A"/>
            <ellipse class="doggo-eyelid doggo-eyelid-right" cx="62" cy="26" rx="3.8" ry="3.8" fill="#E0A86A"/>
            <ellipse cx="56" cy="32" rx="3.2" ry="2.2" fill="#2D1B0E"/>
            <path class="doggo-mouth" d="M50 38 Q56 42 62 38" fill="none" stroke="#2D1B0E" stroke-width="1.5" stroke-linecap="round"/>
          </g>
        </g>
      </g>
    </svg>
  `;

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

  function createDoggo(options) {
    const opts = options || {};
    const host = opts.root;
    const svgMarkup = opts.svg || DEFAULT_SVG;
    const mouthPaths = Object.assign({}, MOUTH, opts.mouthPaths || {});

    const dog = document.createElement("div");
    dog.className = "doggo-companion doggo-idle doggo-calm";
    dog.setAttribute("role", "img");
    dog.setAttribute("aria-label", "Hello Puppy companion");
    dog.style.setProperty("--doggo-phase", `-${(Math.random() * 2.4).toFixed(2)}s`);
    dog.innerHTML = svgMarkup;
    if (!dog.querySelector(".doggo-figure")) {
      dog.innerHTML = DEFAULT_SVG;
    }

    const treat = document.createElement("div");
    treat.className = "doggo-treat";

    host.appendChild(dog);
    host.appendChild(treat);

    const pupilL = dog.querySelector(".doggo-pupil-left");
    const pupilR = dog.querySelector(".doggo-pupil-right");
    const mouth = dog.querySelector(".doggo-mouth");

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
      return Math.max(minX(), window.innerWidth * 0.9 - W);
    }

    function setPos(x) {
      posX = clamp(x, minX(), maxX());
      dog.style.left = `${posX}px`;
    }

    function setFacing(right) {
      facingRight = !!right;
      // Art faces right by default; flip only when facing left.
      dog.classList.toggle("doggo-flip", !facingRight);
    }

    function setExcited(ms) {
      excitedUntil = Date.now() + ms;
      dog.classList.add("doggo-excited");
      dog.classList.remove("doggo-calm");
    }

    function refreshTailMood() {
      if (destroyed) return;
      if (Date.now() < excitedUntil || busy) {
        dog.classList.add("doggo-excited");
        dog.classList.remove("doggo-calm");
      } else {
        dog.classList.add("doggo-calm");
        dog.classList.remove("doggo-excited");
      }
    }

    function clearActionClasses() {
      dog.classList.remove(
        "doggo-hop",
        "doggo-roll",
        "doggo-paw",
        "doggo-stretch",
        "doggo-chew",
        "doggo-walk",
        "doggo-walk-slow",
        "doggo-walk-normal",
        "doggo-walk-excited",
        "doggo-blink",
        "doggo-peek",
        "doggo-look-left",
        "doggo-look-right",
        "doggo-ear-twitch-left",
        "doggo-ear-twitch-right"
      );
      if (mouth) mouth.setAttribute("d", mouthPaths.idle);
    }

    async function withBusy(fn) {
      if (destroyed || busy) return false;
      busy = true;
      dog.classList.add("doggo-busy");
      dog.classList.remove("doggo-idle");
      try {
        await fn();
      } finally {
        busy = false;
        if (!destroyed) {
          clearActionClasses();
          dog.classList.remove("doggo-busy");
          dog.classList.add("doggo-idle");
          refreshTailMood();
        }
      }
      return true;
    }

    function playClass(name, ms) {
      return withBusy(async () => {
        dog.classList.add(name);
        setExcited(ms + 400);
        await wait(ms);
      });
    }

    function givePaw() {
      return withBusy(async () => {
        dog.classList.add("doggo-paw");
        setExcited(1400);
        await wait(1000);
      });
    }

    async function blink() {
      if (destroyed || busy) return;
      dog.classList.add("doggo-blink");
      await wait(200);
      if (destroyed) return;
      dog.classList.remove("doggo-blink");
    }

    async function earTwitch() {
      if (destroyed || busy) return;
      const cls = Math.random() < 0.5 ? "doggo-ear-twitch-left" : "doggo-ear-twitch-right";
      dog.classList.add(cls);
      await wait(300);
      if (destroyed) return;
      dog.classList.remove(cls);
    }

    async function lookAround() {
      if (destroyed || busy || Date.now() < lookOverrideUntil) return;
      await withBusy(async () => {
        dog.classList.add("doggo-look-left");
        await wait(550);
        if (destroyed) return;
        dog.classList.remove("doggo-look-left");
        dog.classList.add("doggo-look-right");
        await wait(550);
        if (destroyed) return;
        dog.classList.remove("doggo-look-right");
        await wait(200);
      });
    }

    async function stretchYawn() {
      await withBusy(async () => {
        dog.classList.add("doggo-stretch");
        if (mouth) mouth.setAttribute("d", mouthPaths.yawn);
        await wait(1400);
        if (destroyed) return;
        if (mouth) mouth.setAttribute("d", mouthPaths.idle);
        await wait(600);
      });
    }

    function updateEyes(clientX, clientY) {
      if (destroyed || !pupilL || !pupilR || busy) return;
      const rect = dog.getBoundingClientRect();
      const cx = rect.left + rect.width * (facingRight ? 0.62 : 0.4);
      const cy = rect.top + rect.height * 0.32;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const max = 2.3;
      const ox = (dx / dist) * Math.min(max, dist / 36);
      const oy = (dy / dist) * Math.min(max, dist / 36);
      // Compensate for scaleX(-1) when facing left.
      const localX = facingRight ? ox : -ox;
      pupilL.setAttribute("transform", `translate(${localX} ${oy})`);
      pupilR.setAttribute("transform", `translate(${localX} ${oy})`);
    }

    function peekFromScroll() {
      if (destroyed || busy) return;
      lookOverrideUntil = Date.now() + 900;
      dog.classList.remove("doggo-look-left", "doggo-look-right");
      dog.classList.add("doggo-peek");
      setExcited(700);
      clearTimeout(scrollPeekTimer);
      scrollPeekTimer = setTimeout(() => dog.classList.remove("doggo-peek"), 700);
    }

    function walkTo(targetX, speedPxPerSec = 140, gait = "normal") {
      return withBusy(async () => {
        const start = posX;
        const dist = targetX - start;
        if (Math.abs(dist) < 4) return;
        setFacing(dist > 0);
        dog.classList.remove("doggo-walk-slow", "doggo-walk-normal", "doggo-walk-excited");
        dog.classList.add("doggo-walk", `doggo-walk-${gait}`);
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
        dog.classList.remove("doggo-walk", "doggo-walk-slow", "doggo-walk-normal", "doggo-walk-excited");
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
        const rect = dog.getBoundingClientRect();
        treat.style.left = `${rect.left + (facingRight ? rect.width - 34 : 18)}px`;
        treat.style.top = `${rect.top + 16}px`;
        treat.classList.remove("doggo-treat-show");
        void treat.offsetWidth;
        treat.classList.add("doggo-treat-show");
        await wait(700);
        if (destroyed) return;
        dog.classList.add("doggo-chew");
        if (mouth) mouth.setAttribute("d", mouthPaths.chew);
        await wait(1700);
        if (destroyed) return;
        treat.classList.remove("doggo-treat-show");
        if (mouth) mouth.setAttribute("d", mouthPaths.idle);
      });
    }

    async function onDogClick(e) {
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
        await playClass("doggo-roll", 1100);
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
      el: dog,
      onPointerMove(clientX, clientY) {
        if (destroyed) return;
        lookOverrideUntil = Date.now() + 400;
        dog.classList.remove("doggo-look-left", "doggo-look-right", "doggo-peek");
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
        dog.removeEventListener("click", onDogClick);
        dog.remove();
        treat.remove();
      },
    };

    setPos(typeof opts.startX === "number" ? opts.startX : minX() + Math.random() * Math.max(0, maxX() - minX()));
    setFacing(Math.random() < 0.5);
    dog.addEventListener("click", onDogClick);

    intervals.push(setInterval(tickIdle, 1600));
    intervals.push(setInterval(refreshTailMood, 400));

    setTimeout(() => {
      if (!destroyed && !busy) playClass("doggo-hop", 550);
    }, 400 + Math.random() * 600);

    setTimeout(() => scheduleRoam(), 1200 + Math.random() * 1600);

    return api;
  }

  window.DoggoDog = { createDoggo, MOUTH, DEFAULT_SVG };
})();
