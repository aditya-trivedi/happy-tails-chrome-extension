(function () {
  if (window.__pawsomeInjected) return;
  window.__pawsomeInjected = true;

  const STORAGE_KEY = "pawsomeSettings";
  const DEFAULT_SETTINGS = { version: 1, species: "dog" };

  const root = document.createElement("div");
  root.id = "pawsome-root";
  document.documentElement.appendChild(root);

  let pet = null;

  function normalizeSpecies(value) {
    return value === "cat" ? "cat" : "dog";
  }

  function speciesFromSettings(raw) {
    const source = raw && typeof raw === "object" ? raw : DEFAULT_SETTINGS;
    return normalizeSpecies(source.species);
  }

  function showSpecies(species) {
    const next = normalizeSpecies(species);
    if (pet && pet.species === next) return;
    if (pet) pet.destroy();
    pet = window.Pawsome.createPet({ root, species: next });
  }

  function readSettings(callback) {
    try {
      chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_SETTINGS }, (result) => {
        callback(speciesFromSettings(result[STORAGE_KEY]));
      });
    } catch (err) {
      callback(DEFAULT_SETTINGS.species);
    }
  }

  function watchSettings() {
    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "sync" || !changes[STORAGE_KEY]) return;
        showSpecies(speciesFromSettings(changes[STORAGE_KEY].newValue));
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

  readSettings(showSpecies);
  watchSettings();
})();
