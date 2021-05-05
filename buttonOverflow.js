window.buttonOverflow = {};

Hooks.on("renderPlayerList", (_playerList, html) => {
  document.body.style.setProperty("--playerlist-height", `${html.height()}px`);
  calcOffset();
});

window.addEventListener("resize", () => {
  calcOffset();
});

function calcOffset() {
  const controlsHeight = $("#controls").height();
  const n = Math.ceil((window.buttonOverflow.controlAmount / controlsHeight) * 46) * 46 + 10;
  document.body.style.setProperty("--playerlist-offset", `${n}px`);
}

Hooks.on("ready", () => {
  window.buttonOverflow.controlAmount = document.querySelector('ol#controls').childElementCount;
  calcOffset();
})
