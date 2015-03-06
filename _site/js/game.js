(function(){

  // API

  function Server(){
    //this.pusher = new Pusher('a8dc613841aa8963a8a4', { authTransport: 'jsonp' });
    this.api = "https://blastermind.herokuapp.com";
  };


  // PARSING

  var getMatch = function(server, game){
    var matchesEndpoint = server.api + "/matches";
    var matches = $.get(matchesEndpoint, function(){});

    matches.done(function(data){
      var matchesObject = JSON.parse(data);
      //var matchResult = paresLastMatch(matchesObject);
      var matchResult = matchesObject.data[3]; //testing

      var players = parsePlayers(matchResult);
      game.setPlayers(players);

      var matchToPlay = new Match(matchResult);
      game.setMatch(matchToPlay);
    });
  };

  var parsePlayers = function(match) {
    var playersList = match.players;
    var players = [];

    for (i=0; i<playersList.length; i++){
      var player = playersList[i];
      players.push(new Player(player.id, player.name));
    };

    return players
  };

  var parseLastMatch = function(matches) {
    return matches.data[matches.data.length-1];
  };

  // PLAYERS
  function Player(id, name){
    this.id = id;
    this.name = name;
  };

  // MATCHES

  function Match(response){
    this.response = response;
    this.id = "";
    this.channel = "";
    this.setup();
  };

  Match.prototype.setup = function() {
    this.id = this.response.id;
    this.channel = this.response.channel;
  }


  // GAME

  function Game(){
    this.match = "";
    this.players = "";
  };

  Game.prototype.setMatch = function(match) {
    this.match = match;
  };

  Game.prototype.setPlayers = function(players) {
    this.players = players;
  };

  // PLAY
  //getMatch(server, game);

  var findMatches = function(server){
    var matchesEndpoint = server.api + "/matches";
    var matchesResponse = {};
    var matches = $.get(matchesEndpoint, function(){});

    matches.done(function(data){
      matchesResponse = JSON.parse(data);
    });
    console.log(matchesResponse);
    return matchesResponse;
  };

  var formatMatchesResponse = function(apiMatches){
    var matchesResponse = ""
    if (apiMatches.length > 0) {
      for (i=0; i<apiMatches.length; i++) {
        console.log(apiMatches[i]);
      };
    } else {
      var matchesResponse = "<div>No matches found! Reload the page to check again.</div>"
    };
    return matchesResponse;
  };

  var updateView = function(selector, data) {
    $(selector).html(data);
  };

  $(document).ready(function(){
    var server = new Server();
    var apiMatches = findMatches(server);
    console.log(apiMatches);
    var matchesResponse = formatMatchesResponse(apiMatches);
    updateView(".matches-grid", matchesResponse);
  });
})();
