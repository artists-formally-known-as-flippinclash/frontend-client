function EventListener(){
  this.pusher = new Pusher('a8dc613841aa8963a8a4', { authTransport: 'jsonp' })
  this.channel = this.pusher.subscribe('game-us')
  this.newGame()
}

EventListener.prototype.newGame = function(){
  this.channel.bind('match-started', function(){
    alert('match started!')
  })

  this.channel.bind('match-ended', function(){
    alert('match-ended!')
  })
}
