(function(){

  // API
  function Server(){
    //this.pusher = new Pusher('a8dc613841aa8963a8a4', { authTransport: 'jsonp' });
    this.api = "https://blastermind.herokuapp.com";
  };

  // STATE 1: Listing In-Progress Matches;
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
      for (i=apiMatches.length-1; i>0; i--) {
        var matchId = apiMatches[i].id.toString();
        if (apiMatches[i].state == "in_progress") {
          var matchesResponse = matchesResponse + "<div class=match-button rel=" + matchId + ">" + "Match " + matchId +"</div>"
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

  var listenForMatchSelection = function(game) {
    $(".matches-grid").on( "click", ".match-button", function(){
      var matchNo = $(this).attr('rel');
      var matchIdInt = parseInt(matchNo);
      var match = availabileMatches[matchIdInt-1]

      $('.headline').text("Match "+matchNo)
      $('.headline').addClass("viewing")
    });
  };

  // STATE 2: LOAD MATCH

  var showMatch = function() {
  }

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


  // ON PAGE LOAD

  $(document).ready(function(){
    var server = new Server();
    var game = new Game();
    availabileMatches = "";

    findMatches(server, function (apiMatches) {
      availabileMatches = apiMatches.data
      var matchesResponse = formatMatchesResponse(apiMatches.data);
      updateView(".matches-grid", matchesResponse);
    });

    listenForMatchSelection(game);
  });
})();
