(function() {

  function Round(playerName) {
    this.apiURL = "https://blastermind.herokuapp.com";
    this.testURL = "http://private-fc2d3-blastermind.apiary-mock.com";
    this.playerName = playerName;
    this.playerRegistration = { player: { name: this.playerName } }
  }

  Round.prototype.registerPlayer = function() {
    var round = this;
    var registerPlayerName = $.ajax({
      type: "POST",
      url: round.apiURL + "/matches",
      data: round.playerRegistration,
    });

    registerPlayerName.done(function (_dada) {
      debugger
   });
  }

  var startRound = function() {
    $(".new-game").on("mouseup", function(event) {
      event.preventDefault();

      var playerName = nameExtender("WebClient")
      var round = new Round(playerName);
      round.registerPlayer();
    });
  };

  var nameExtender = function(name) {
    uniquenessExtender = Math.floor((Math.random() * 1000000000) + 1);
    return name + uniquenessExtender.toString();
  }

  startRound();
})();
