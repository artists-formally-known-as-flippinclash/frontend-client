(function() {
  function Dispatcher(round){
    this.pusher = new EventListener();
    this.round = new Round();
  }


  var startRound = function() {
    $(".new-game").on("mouseup", function(event) {
      event.preventDefault();
      var playerName = nameExtender("WebClient")
      var round = new Round(playerName);
      round.registerPlayer();
    });
    debugger;
    return round
  };

  var nameExtender = function(name) {
    uniquenessExtender = Math.floor((Math.random() * 1000000000) + 1);
    return name + uniquenessExtender.toString();
  }

  var name = nameExtender("webClient")
  debugger;

})();
