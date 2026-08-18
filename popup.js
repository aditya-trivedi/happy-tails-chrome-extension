const MAX_DOGS = 5;
const DEFAULT_SETTINGS = { version: 1, count: 1 };

const slider = document.getElementById("count");
const readout = document.getElementById("count-value");
const label = document.querySelector(".count-readout");

function render(count) {
  slider.value = String(count);
  readout.textContent = String(count);
  label.textContent = "";
  label.append(readout, document.createTextNode(count === 1 ? " puppy" : " puppies"));
}

chrome.storage.sync.get({ doggoSettings: DEFAULT_SETTINGS }, (result) => {
  const settings = result.doggoSettings || DEFAULT_SETTINGS;
  render(Math.min(MAX_DOGS, Math.max(1, Number(settings.count) || 1)));
});

slider.addEventListener("input", () => {
  const count = Number(slider.value);
  render(count);
  chrome.storage.sync.get({ doggoSettings: DEFAULT_SETTINGS }, (result) => {
    const next = Object.assign({}, result.doggoSettings || DEFAULT_SETTINGS, { count });
    chrome.storage.sync.set({ doggoSettings: next });
  });
});
