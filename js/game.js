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
      var limit = apiMatches.length - 10
      for (i=apiMatches.length-1; i>limit; i--) {
        var matchId = apiMatches[i].id.toString();
        if (apiMatches[i].state == "in_progress") {
          var matchesResponse = matchesResponse + "<div class=match-button rel=" + matchId + ">" + "Match " + apiMatches[i].name +"</div>"
        }
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
      var match = availabileMatches[matchIdInt-1];

      $('.headline').text("Match "+ match.name);
      $('.headline').addClass("viewing");

      loadMatch(match, game);
      loadPlayers(match, game);

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
      players.push(new Player(player.id, player.name));
    };
    game.setPlayers(players);
  };

  function Player(id, name){
    this.id = id;
    this.name = name;
    this.guesses = [];
  };

  function Match(id, channel){
    this.id = "";
    this.channelName = channel;
    this.state = "In-Progress";
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
      }
    }
    return player;
  }

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

    eventMatchStarted(game);
    eventMatchEnded(game);
    eventMatchProgress(game);
  }

  // STATE 3: MATCH VIEWING ////////////////////////////////////////////////////

  var eventMatchEnded = function(game){
    game.channel.bind('match-ended', function(data){
      console.log('Pusher binded to event: match-ended!');
      var winnerName = data.data.winner.name;
      $('.outcome h2').text(winnterName + " is the Winner!");

      var playerGrid = ".player-grid-" + data.data.winner.id.toString();
      $(playerGrid).css('background', 'pink');
    });
  };

  var eventMatchStarted = function(game) {
    game.channel.bind('match-started', function(){
      console.log(data);
      console.log('Pusher binded to event: match-started');
    });
  };

  var eventMatchProgress = function(game) {
    game.channel.bind('match-progress', function(data){
      //iterate over players
      for (a=0; a<data.data.players.length; a++){
        var pusherPlayer = data.data.players[a];
        var player = game.getPlayerById(pusherPlayer.id);
        player.updateGuesses(pusherPlayer.guesses);
        var playerGrid =".player-grid-" + a.toString();

        //iterate over player's guesses
        //find guess div
        for (g=0; g<player.guesses.length; g++){
          var playedGuess = player.guesses[g];
          var guessNo = ".guess-" + g.toString();

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
    });
  };

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

    availabileMatches = "";

    findMatches(server, function (apiMatches) {
      availabileMatches = apiMatches.data
      var matchesResponse = formatMatchesResponse(apiMatches.data);
      updateView(".matches-grid", matchesResponse);
    });

    // State 2 & 3
    listenForMatchSelection(game, pusher);
  });
})();
