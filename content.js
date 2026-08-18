(function () {
  if (window.__doggoCompanionInjected) return;
  window.__doggoCompanionInjected = true;

  const MAX_DOGS = 5;
  const DEFAULT_SETTINGS = { version: 1, count: 1 };
  const DOG_WIDTH = 115;

  const root = document.createElement("div");
  root.id = "doggo-companion-root";
  document.documentElement.appendChild(root);

  const dogs = [];

  function laneX(index, total) {
    const min = window.innerWidth * 0.1;
    const max = Math.max(min, window.innerWidth * 0.9 - DOG_WIDTH);
    if (total <= 1) return min + (max - min) * (0.3 + Math.random() * 0.4);
    const step = (max - min) / total;
    return min + step * index + step * (0.25 + Math.random() * 0.5);
  }

  function normalizeCount(value) {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return DEFAULT_SETTINGS.count;
    return Math.min(MAX_DOGS, Math.max(1, n));
  }

  function setCount(rawCount) {
    const target = normalizeCount(rawCount);
    while (dogs.length > target) {
      dogs.pop().destroy();
    }
    while (dogs.length < target) {
      const index = dogs.length;
      dogs.push(
        window.DoggoDog.createDoggo({
          root,
          peers: dogs,
          startX: laneX(index, target),
        })
      );
    }
  }

  function readSettings(callback) {
    try {
      chrome.storage.sync.get({ doggoSettings: DEFAULT_SETTINGS }, (result) => {
        const settings = (result && result.doggoSettings) || DEFAULT_SETTINGS;
        callback(settings);
      });
    } catch (err) {
      callback(DEFAULT_SETTINGS);
    }
  }

  function watchSettings() {
    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "sync" || !changes.doggoSettings) return;
        const next = changes.doggoSettings.newValue || DEFAULT_SETTINGS;
        setCount(next.count);
      });
    } catch (err) {
      /* storage unavailable (e.g. preview page) — static count is fine */
    }
  }

  window.addEventListener(
    "mousemove",
    (e) => {
      for (const dog of dogs) dog.onPointerMove(e.clientX, e.clientY);
    },
    { passive: true }
  );

  let lastScrollY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      if (Math.abs(dy) <= 4) return;
      for (const dog of dogs) dog.onScrollBurst();
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    for (const dog of dogs) dog.onResize();
  });

  const previewCount = new URLSearchParams(location.search).get("dogs");
  if (previewCount) {
    setCount(previewCount);
  } else {
    readSettings((settings) => setCount(settings.count));
    watchSettings();
  }
})();
