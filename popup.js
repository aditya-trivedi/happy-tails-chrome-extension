(function () {
  const STORAGE_KEY = "pawsomeSettings";
  const DEFAULT_SETTINGS = { version: 1, species: "dog" };

  function normalizeSpecies(value) {
    return value === "cat" ? "cat" : "dog";
  }

  function normalizeSettings(raw) {
    const source = raw && typeof raw === "object" ? raw : DEFAULT_SETTINGS;
    return { version: 1, species: normalizeSpecies(source.species) };
  }

  const dogArt = document.getElementById("dog-art");
  const catArt = document.getElementById("cat-art");
  dogArt.innerHTML = window.Pawsome.DOG_SVG;
  catArt.innerHTML = window.Pawsome.CAT_SVG;

  const buttons = Array.from(document.querySelectorAll("[data-species]"));

  function render(species) {
    const chosen = normalizeSpecies(species);
    for (const btn of buttons) {
      const on = btn.dataset.species === chosen;
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
    }
  }

  function save(species) {
    const settings = { version: 1, species: normalizeSpecies(species) };
    render(settings.species);
    try {
      chrome.storage.sync.set({ [STORAGE_KEY]: settings });
    } catch (err) {
      /* storage unavailable */
    }
  }

  try {
    chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_SETTINGS }, (result) => {
      render(normalizeSettings(result[STORAGE_KEY]).species);
    });
  } catch (err) {
    render(DEFAULT_SETTINGS.species);
  }

  for (const btn of buttons) {
    btn.addEventListener("click", () => save(btn.dataset.species));
    btn.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const next = e.key === "ArrowRight" ? "cat" : "dog";
      save(next);
      document.querySelector(`[data-species="${next}"]`).focus();
    });
  }
})();
