(function(){

  // STATE 1: MATCH LOADING ////////////////////////////////////////////////////

  var findMatches = function(server, callback){
    var matchesEndpoint = server.api + "/matches";
    var matches = $.get(matchesEndpoint, function(){});
    matches.done(function(data){
      var returnResponse = JSON.parse(data);
      callback(returnResponse);
    });
  };

  var formatMatchesResponse = function(apiMatches){
    var matchesResponse = ""
    if (apiMatches.length > 0) {
      for (i=apiMatches.length-1; i>-1; i--) {
        if (apiMatches[i].state == "in_progress") {
          var matchesResponse = matchesResponse + "<div class=match-button rel=" + i.toString() + ">" + apiMatches[i].name +"</div>"
        };
      };
    } else {
      var matchesResponse = "<div>No matches found! Reload the page to check again.</div>"
    };
    return matchesResponse;
  };

  var updateView = function(selector, data) {
    $(selector).html(data);
  };

  // PARSING
  var parseLastMatch = function(matches) {
    return matches.data[matches.data.length-1];
  };

  // Game
  function Game(){
    this.match = "";
    this.players = "";
    this.channel = "";
    this.winner = "";
  };

  // API
  function Server(){
    this.api = "https://blastermind.herokuapp.com";
  };



  // STATE 2: MATCH SELECTION /////////////////////////////////////////////////

  var listenForMatchSelection = function(game, pusher) {
    $(".matches-grid").on( "click", ".match-button", function(){
      var matchNo = $(this).attr('rel');
      var matchIdInt = parseInt(matchNo);
      var match = availabileMatches[matchIdInt];
      $('.headline').text("Match "+ match.name);
      $('.headline').addClass("viewing");

      loadMatch(match, game);
      loadPlayers(match, game);

      updatePlayerGuessCodePegs(game, match);
      updatePlayerGuessFeedback(game, match);

      listenToEvents(game, pusher);
      updateBoards(game);
    });
  };

  var loadMatch = function(unparsedMatch, game){
    var matchObj = new Match(unparsedMatch.id, unparsedMatch.channel);
    game.setMatch(matchObj);
  }

  var loadPlayers = function(match, game) {
    var playersList = match.players;
    var players = [];
    for (i=0; i<playersList.length; i++){
      var player = playersList[i];
      players.push(new Player(player.id, player.name, i));
    };
    game.setPlayers(players);
  };

  function Player(id, name, order){
    this.id = id;
    this.name = name;
    this.guesses = [];
    this.order = "";
  };

  function Match(id, channel){
    this.id = "";
    this.channelName = channel;
    this.state = "New";
    this.firstLoad = true;
  };


  Game.prototype.setMatch = function(match) {
    this.match = match;
  };

  Game.prototype.setPlayers = function(players) {
    this.players = players;
  };

  Game.prototype.getPlayerById = function(id) {
    var player = "";
    for (i=0; i<this.players.length; i++){
      if (this.players[i].id == id) {
        player = this.players[i];
      };
    };
    return player;
  };

  Game.prototype.setChannel = function(channel) {
    this.channel = channel;
  };

  var listenToEvents = function(game, pusher) {
    var channelName = game.match.channelName;
    game.setChannel(pusher.subscribe(channelName));
    console.log('Pusher subscribed to channel ' + channelName);
    $(window).on('beforeunload', function(){
      pusher.unsubscribe(channelName);
    });

    eventMatchProgress(game);
    eventMatchEnded(game, pusher);
  }

  // STATE 3: MATCH VIEWING ////////////////////////////////////////////////////

  var eventMatchEnded = function(game, pusher){
    game.channel.bind('match-ended', function(data){
      console.log('Pusher binded to event: match-ended!');
      var winner = data.data.winner;

      if (typeof winner === "undefined") {
        $('.headline').text('Sorry, You lost!');
      } else {
        game.hasWinner(winner);
        $('.headline').text(winner.name + " is the Winner!");
        $('.headline').addClass('yellow');
      };

      var channelName = game.match.channelName;
      pusher.unsubscribe(channelName);
    });
  };

  Game.prototype.hasWinner = function(winner){
    this.winner = winner;
  }

  var eventMatchProgress = function(game) {
    game.channel.bind('match-progress', function(data){
      debugger;

      if (game.match.firstLoad == true) {
        updatePlayerGuessCodePegs(game, data.data);
        updatePlayerGuessFeedback(game, data.data);
        game.match.firstLoadDone();
      } else {
        debugger;
        updateNextGuess(game, data);
      };
    });
  };

  Match.prototype.firstLoadDone = function(){
    this.firstLoad = false;
  }

  var updateNextGuess = function(game, data) {
    //iterate over players
    debugger;
    var allPlayers = game.players;
    for (a=0; a<allPlayers.length; a++){
      var pusherPlayer = data.data.players[a];
      var player = game.getPlayerById(pusherPlayer.id);
      var playerGrid =".player-grid-" + player.order.toString();

      debugger;
      player.updateGuesses(pusherPlayer.guesses);
      var guessIndex = player.guesses.length-1;
      var guess = player.guesses[guessIndex];
      var guessNo = ".guess-" + (guessIndex).toString();
      var guessSelector = $(playerGrid).find(guessNo);

      debugger;
      // update last feedback
      var feedback = combineFeedback(guess);
      //iterate over available key-peg slots
      //update view
      for (k=0;k>4;k++){
        var keyPeg = ".key-peg-" + k.toString();
        var keyPegView = guessSelector.find(keyPeg);
        var feedbackColor = feedback[k];
        $(keyPegView).addClass(feedbackColor);
      };

      //iterate over code-peg slots
      //update view
      for (p=0; p<4; p++){
        var playedCodePeg = guess.code_pegs[p];
        var codePeg = ".code-peg-" + p.toString();
        var codePegView = guessSelector.find(codePeg);
        $(codePegView).addClass(playedCodePeg);
        debugger;
      };
    };
  };

  var updatePlayerGuessFeedback = function(game, data){
    //iterate over players
    for (a=0; a<data.players.length; a++){
      var pusherPlayer = data.players[a];
      var player = game.getPlayerById(pusherPlayer.id);
      player.updateGuesses(pusherPlayer.guesses);

      // if player has 10 guesses but did not guess correctly (no winner determined)
      if (player.guesses.length >= 10 && game.winner == "") {
        playerLost(player);
      }
      var playerGrid =".player-grid-" + a.toString();
      //iterate over player's guesses
      //find guess div
      for (g=0; g<player.guesses.length; g++){
        var playedGuess = player.guesses[g];
        var guessNo = ".guess-" + (g).toString();
        var feedback = combineFeedback(playedGuess);

        //iterate over available key-peg slots
        //update view
        for (k=0;k<4;k++){
          var keyPeg = ".key-peg-" + k.toString();
          var keyPegView = $(playerGrid).find(guessNo).find(keyPeg);
          var feedbackColor = feedback[k];

          $(keyPegView).removeClass("red" ).removeClass("grey")
          $(keyPegView).addClass(feedbackColor);

        };
      };
    };
  };

  var playerLost = function(player) {
    var selector = "player-name-" + player.order.toString();
    $(selector).text("LOST!");
    $(selector).parent().addClass("player-lost");
  };

  var combineFeedback = function(guess){
    var orderedFeedbackPegs = [];
    var pegCount = guess.feedback.peg_count;
    var positionCount = guess.feedback.position_count;

    for (i=0;i<pegCount; i++){ orderedFeedbackPegs.push("grey"); };
    for (i=0;i<positionCount;i++){ orderedFeedbackPegs.push("red"); };
    return orderedFeedbackPegs;
  };

  var updatePlayerGuessCodePegs = function(game, data) {
    //iterate over player
    for (a=0; a<data.players.length; a++){
      var pusherPlayer = data.players[a];
      var player = game.getPlayerById(pusherPlayer.id);
      player.updateGuesses(pusherPlayer.guesses);
      var playerGrid =".player-grid-" + a.toString();

      //iterate over player's guesses
      //find guess div
      for (g=0; g<player.guesses.length; g++){
        var playedGuess = player.guesses[g];
        var guessNo = ".guess-" + (g).toString();

        //iterate over player guesses code-pegs
        //find code peg div
        for (p=0; p<4; p++){
          var playedCodePeg = playedGuess.code_pegs[p];
          var codePeg = ".code-peg-" + p.toString();
          var codePegView = $(playerGrid).find(guessNo).find(codePeg);
          $(codePegView).addClass(playedCodePeg);
        };
      };
    };
  }

  Player.prototype.updateGuesses = function(guesses){
    this.guesses = guesses;
  }

  var updateBoards = function(game) {
    var players = game.players;

    for (i=0; i<players.length; i++){
      var player = players[i];
      var playerName = ".player-name-" + i.toString();
      $(playerName).text(player.name);
      $(playerName).removeClass("no-player");
      $(playerName).addClass("player-name");

      var playerGrid = ".player-grid-" + i.toString();
      $(playerGrid).removeClass("player-grid");
      $(playerGrid).addClass("player-grid-playing");
    }

    $(".matches-grid").hide();
    $(".matches-boards").show();
  }

  //////////////////////////////////////////////////////////////////////////////


  // ON PAGE LOAD /////////////////////////////////////////////////////////////

  $(document).ready(function(){

    // State 1
    var server = new Server();
    var game = new Game();
    var pusher = new Pusher('a8dc613841aa8963a8a4', { authTransport: 'jsonp' });

    function availableMatches() { availableMatches = "Volvo"; };

    findMatches(server, function (apiMatches) {
      availabileMatches = apiMatches.data
      var matchesResponse = formatMatchesResponse(apiMatches.data);
      updateView(".matches-grid", matchesResponse);
    });

    // State 2 & 3
    listenForMatchSelection(game, pusher);
  });
})();
