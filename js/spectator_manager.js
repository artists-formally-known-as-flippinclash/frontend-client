(function() {
  function SpectatorManager(){
    // match manger
    // idle mode
    // match making
    // player manager
    this.playerCount = 4
  }

  SpectatorManager.prototype.setup = function() {
   alert('Loaded!')
  }

  spectator_manager = new SpectatorManager
  spectator_manager.setup
})();


