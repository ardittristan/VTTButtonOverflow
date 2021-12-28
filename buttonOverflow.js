window.buttonOverflow = window.buttonOverflow || {};

function calcOffset() {
  const controls = $("#controls .main-controls");
  const controlsRect = {
    h: controls.height(),
    padding: {
      r: getPadding(controls, "right"),
      l: getPadding(controls, "left"),
    },
  };
  const button = $("#controls .control-tool").first();
  const buttonRect = {
    w: button.outerWidth(),
    h: button.outerHeight(),
    margin: {
      t: getMargin(button, "top"),
      r: getMargin(button, "right"),
      b: getMargin(button, "bottom"),
      l: getMargin(button, "left"),
    },
  };

  const //
    Tbh = buttonRect.h + buttonRect.margin.t + buttonRect.margin.b,
    Tbw = buttonRect.w + buttonRect.margin.l + buttonRect.margin.r,
    Cp = controlsRect.padding.l + controlsRect.padding.r,
    ßc = window.buttonOverflow.controlAmount,
    Hc = window.buttonOverflow.hiddenButtons;

  // Tbh = Bh + Bmt + Bmb
  // Tbw = Bw + Bml + Bmr
  // Math.ceil(((ßc - Hc) * Tbh) / (Ch - (Ch % Tbh))) * Tbw + Cpl + Cpr
  const n = Math.ceil(((ßc - (Hc || 0)) * Tbh) / (controlsRect.h - (controlsRect.h % Tbh))) * Tbw + Cp;

  document.body.style.setProperty("--buttonlist-width", `${n}px`);
}

/**
 * @param  {JQuery<HTMLElement>} el
 * @param  {"top" | "right" | "bottom" | "left"} side
 */
function getMargin(el, side) {
  return Number(el.css("margin-" + side)?.replace("px", "")) || 0;
}

/**
 * @param  {JQuery<HTMLElement>} el
 * @param  {"top" | "right" | "bottom" | "left"} side
 */
function getPadding(el, side) {
  return Number(el.css("padding-" + side)?.replace("px", "")) || 0;
}

Hooks.on("ready", () => {
  window.buttonOverflow.controlAmount = document.querySelector("#controls .main-controls").childElementCount;
  calcOffset();

  Hooks.on("renderPlayerList", (_playerList, html) => {
    calcOffset();
  });

  window.addEventListener("resize", () => {
    calcOffset();
  });
});

Hooks.on("init", () => {
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
  window.buttonOverflow.hiddenButtons = game.settings.get("buttonoverflow", "hiddenButtons");
});
