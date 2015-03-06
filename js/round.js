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
    return round;
  });
}
