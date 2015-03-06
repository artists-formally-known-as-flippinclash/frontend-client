(function() {

  function Round() {
    this.apiURL = "https://blastermind.herokuapp.com";
    this.testURL = "http://private-fc2d3-blastermind.apiary-mock.com";
  }

  Round.prototype.registerPlayer = function(name) {
    var data = { player: { name: name } };
    var round = this;
    var registerPlayerName = $.ajax({
      type: "POST",
      url: round.apiURL + "/matches",
      data: data,
    });

    registerPlayerName.done(function (_dada) {
      debugger
   });
  }

  var startRound = function() {
    var round = new Round();
    $(".new-game").on("mouseup", function(event) {
        event.preventDefault();
        var player = round.registerPlayer("hay");
        console.log(player);
    });
  };

  startRound();
})();
