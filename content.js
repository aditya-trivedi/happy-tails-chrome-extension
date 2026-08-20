(function () {
  if (window.__pawsomeInjected) return;
  window.__pawsomeInjected = true;

  const STORAGE_KEY = "pawsomeSettings";
  const DEFAULT_SETTINGS = { version: 1, species: "dog", breed: "classic" };

  const root = document.createElement("div");
  root.id = "pawsome-root";
  document.documentElement.appendChild(root);

  let pet = null;

  function normalizeSettings(raw) {
    const source = raw && typeof raw === "object" ? raw : DEFAULT_SETTINGS;
    const pawsome = window.Pawsome;
    return {
      version: 1,
      species: "dog",
      breed: pawsome.normalizeBreed(source.breed),
    };
  }

  function showCompanion(settings) {
    const next = normalizeSettings(settings);
    if (pet && pet.breed === next.breed) return;
    if (pet) pet.destroy();
    pet = window.Pawsome.createPet({ root, species: "dog", breed: next.breed });
  }

  function readSettings(callback) {
    try {
      chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_SETTINGS }, (result) => {
        callback(normalizeSettings(result[STORAGE_KEY]));
      });
    } catch (err) {
      callback(DEFAULT_SETTINGS);
    }
  }

  function watchSettings() {
    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "sync" || !changes[STORAGE_KEY]) return;
        showCompanion(normalizeSettings(changes[STORAGE_KEY].newValue));
      });
    } catch (err) {
      /* storage unavailable */
    }
  }

  window.addEventListener(
    "mousemove",
    (e) => {
      if (pet) pet.onPointerMove(e.clientX, e.clientY);
    },
    { passive: true }
  );

  let lastScrollY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      if (Math.abs(dy) > 4 && pet) pet.onScrollBurst();
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    if (pet) pet.onResize();
  });

  readSettings(showCompanion);
  watchSettings();
})();
