function Round() {
    this.apiURL = "https://blastermind.herokuapp.com";
}

Round.prototype.registerPlayer = function () {
    alert("Boom! Registered.")
}

Round.prototype.startRound = function () {
//    debugger;
    var that = this;
    $(".new-game").on("click", function(event) {
        event.preventDefault();
        that.registerPlayer();
    });
};

(function () {
    var round = new Round();
    round.startRound()
})();