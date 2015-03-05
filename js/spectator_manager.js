(function() {
  function SpectatorManager(){
    // match manger
    // idle mode
    // match making
    this.round = new Round().connect();
    this.playerCount = 4
  }

  SpectatorManager.prototype.setup = function() {
   alert('Loaded!')
  }

  spectator_manager = new SpectatorManager().setup();

  function Round (){
    this.state = 'idle'
  }

  Round.prototype.connect = function(){
   var pusher = new Pusher('key12355555', {
     authTransport: 'jsonp',
     authEndpoint: 'http://mysterious-forest-1231323232323232323232323.herokuapp.com/pusher/auth'
   }); 

   var channel = socket.subscribe('match') 
   
  }

})();


