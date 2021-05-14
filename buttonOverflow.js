window.buttonOverflow = window.buttonOverflow || {};
if ((localStorage.getItem("buttonoverflow.useDynamicCalculation") || "false") === "false") {
  document.body.classList.add("oldButtonOverflow");

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
}
//
else {
  window.buttonOverflow.blacklistedIds = /^((hotbar)|(sidebar)|(notifications)|(loading)|(navigation)|(hud)|(board)|(pause))$/;
  window.buttonOverflow.highestCoordinate = 0;

  let rateLimitText = "";
  let rateLimitNow = 0;

  const resizeObserver = new ResizeObserver((resizeRecords) => {
    resizeRecords.forEach((resizeRecord) => {
      calcOverlap(resizeRecord.target.outerHTML);
    });
  });

  const mutationObserver = new MutationObserver((mutationRecords) => {
    mutationRecords.forEach((mutationRecord) => {
      if (mutationRecord.addedNodes?.length > 0) {
        mutationRecord.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && (node.id == undefined || node.id.match(window.buttonOverflow.blacklistedIds) === null)) {
            resizeObserver.observe(node);
            calcOverlap(node.outerHTML);
          }
        });
      }
      if (mutationRecord.removedNodes?.length > 0) {
        mutationRecord.removedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && (node.id == undefined || node.id.match(window.buttonOverflow.blacklistedIds) === null)) {
            resizeObserver.unobserve(node);
            calcOverlap(node.outerHTML);
          }
        });
      }
    });
  });

  document.querySelectorAll("body > *").forEach((el) => {
    if (el.id == undefined || el.id.match(window.buttonOverflow.blacklistedIds) === null) resizeObserver.observe(el);
  });
  calcOverlap();

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: false,
  });

  function calcOverlap(randomText = Date.now().toString()) {
    const now = Date.now();
    rateLimitNow = now - 0;
    rateLimitText = randomText;

    setTimeout(() => {
      if (rateLimitText === randomText && rateLimitNow === now) {
        const docBounds = document.body.getBoundingClientRect();
        /** @type {{left: number, right: number, top: number, bottom: number, el: HTMLElement}[]} */
        let boxes = [];
        document.querySelectorAll("body > *").forEach((el) => {
          if (el.id == undefined || el.id.match(window.buttonOverflow.blacklistedIds) === null) {
            el.style.marginTop = "";
            const boundingRect = el.getBoundingClientRect();
            const bounds = {
              el,
              left: boundingRect.x,
              right: boundingRect.x + boundingRect.width,
              top: boundingRect.y,
              bottom: boundingRect.y + boundingRect.height,
            };
            if (bounds.top > docBounds.height / 3 && bounds.left < docBounds.width / 4) boxes.push(bounds);
          }
        });
        boxes.sort((a, b) => b.top - a.top);
        let boxesCopy = deepClone(boxes);
        boxes.forEach((box, i) => {
          boxesCopy.shift();
          boxesCopy.forEach((box2, j) => {
            if (intersectRect(box, box2)) {
              boxes[i + j].margin = 0 - ((boxes[i + j].margin || 0) + (box.bottom - box2.top));
            }
          });
        });
        if (boxes.length > 0) window.buttonOverflow.highestCoordinate = 99999;
        boxes.forEach((box) => {
          if (box.margin) box.el.style.marginTop = `${box.margin}px`;
          if (box.top + (box.margin || 0) < window.buttonOverflow.highestCoordinate) window.buttonOverflow.highestCoordinate = box.top + (box.margin || 0);
        });
        const buttonHeight = document.querySelector("#controls").getBoundingClientRect().top;
        document.body.style.setProperty(
          "--dynamicMaxButtonHeight",
          `${docBounds.height - buttonHeight - (docBounds.height - window.buttonOverflow.highestCoordinate)}px`
        );
        let furthestRight = 0;
        let leftOffset = 0;
        document.querySelectorAll("#controls > .scene-control").forEach((el) => {
          let boundingRect = el.getBoundingClientRect();
          if (leftOffset == 0) leftOffset = boundingRect.left;
          if (boundingRect.x + boundingRect.width > furthestRight) furthestRight = boundingRect.x + boundingRect.width;
        });
        document.body.style.setProperty("--playerlist-offset", `${furthestRight - leftOffset + 16}px`);
      }
    }, 50);
  }
}

/**
 * @param  {{left: number, right: number, top: number, bottom: number, el: HTMLElement}} r1
 * @param  {{left: number, right: number, top: number, bottom: number, el: HTMLElement}} r2
 */
function intersectRect(r1, r2) {
  return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}

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
  game.settings.register("buttonoverflow", "useDynamicCalculation", {
    scope: "client",
    type: Boolean,
    config: true,
    name: "Calculate all overflows dynamically (experimental)",
    default: false,
    onChange: () => {
      window.location.reload();
    },
  });
  window.buttonOverflow.playerlistOffset = game.settings.get("buttonoverflow", "playerlistOffset");
  window.buttonOverflow.hiddenButtons = game.settings.get("buttonoverflow", "hiddenButtons");
});
