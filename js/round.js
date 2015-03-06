(function() {

  var register = function(round, data) {
    var youknowsomething = 5;

      $.ajax({
        type: "POST",
        url: round.apiURL + "/matches",
        data: data,

     }).done(function(data){

     }).error(function(xhr, status, error){
       console.log(error);
     });
  };

  function Round() {
      this.apiURL = "https://blastermind.herokuapp.com";
      this.testURL = "http://private-fc2d3-blastermind.apiary-mock.com";
      this.name = "Test";
      this.player = "";
  }

  Round.prototype.registerPlayer = function(name) {
      alert("Boom! Registered.");
      var data = { player: { name: name } };
      var round = this;
      var ajaxOp = $.ajax({
        type: "POST",
        url: round.apiURL + "/matches",
        data: data,

     })

     ajaxOp.done(function (_dada) {
        debugger
     });

     ajaxOp.error(function (xhr, status, error){
      console.log(error);
     })
  }

  Round.prototype.startRound = function() {
      var that = this;
      $(".new-game").on("mouseup", function(event) {
          event.preventDefault();
          var player = that.registerPlayer("hay");
          console.log(player);
      });
  };

  (new Round()).startRound();
})();
