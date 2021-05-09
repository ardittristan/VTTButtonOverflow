window.buttonOverflow = {};

Hooks.on("renderPlayerList", (_playerList, html) => {
  calcPlayerListOffset(html);
});

window.addEventListener("resize", () => {
  calcOffset();
});

function calcOffset() {
  const controlsHeight = $("#controls").height();
  const n = Math.ceil(((window.buttonOverflow.controlAmount - (window.buttonOverflow.hiddenButtons || 0)) / controlsHeight) * 46) * 46 + 10;
  document.body.style.setProperty("--playerlist-offset", `${n}px`);
}

/** @param  {JQuery} html */
function calcPlayerListOffset(html = $("#players.app")) {
  document.body.style.setProperty("--playerlist-height", `${html.height() + (window.buttonOverflow.playerlistOffset || 0)}px`);
  calcOffset();
}

Hooks.on("ready", () => {
  window.buttonOverflow.controlAmount = document.querySelector("ol#controls").childElementCount;
  calcOffset();
});

Hooks.on("init", () => {
  game.settings.register("buttonoverflow", "playerlistOffset", {
    scope: "client",
    type: Number,
    config: true,
    name: "Playerlist Offset",
    default: 0,
    onChange: (val) => {
      window.buttonOverflow.playerlistOffset = val;
      calcPlayerListOffset();
    },
  });
  game.settings.register("buttonoverflow", "hiddenButtons", {
    scope: "client",
    type: Number,
    config: true,
    name: "Amount of hidden buttons",
    default: 0,
    onChange: (val) => {
      window.buttonOverflow.hiddenButtons = val;
      calcOffset();
    },
  });
  window.buttonOverflow.playerlistOffset = game.settings.get("buttonoverflow", "playerlistOffset");
  window.buttonOverflow.hiddenButtons = game.settings.get("buttonoverflow", "hiddenButtons");
});
