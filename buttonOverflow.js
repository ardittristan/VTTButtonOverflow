Hooks.on(
  "renderPlayerList",
  /**
   * @param {PlayerList} _playerList
   * @param {JQuery} html
   */
  (_playerList, html) => {
    document.body.style.setProperty("--playerlist-height", `${html.height()}px`);
  }
);
