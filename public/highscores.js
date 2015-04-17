BasicGame.Highscores = function () {
  
}

BasicGame.Highscores.prototype = {
  preload: function () {
    this.load.json('highscores', 'scores.json');
  },

  create: function () {
    this.sea = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'sea');
    this.sea.autoScroll(0, BasicGame.SEA_SCROLL_SPEED);
    
    var highscores = this.cache.getJSON('highscores');

    var scoreString = "Highscores \n\n";

    for (i = 0; i < highscores.length; i++) {
      scoreString += highscores[i].name + "      " + highscores[i].value + "\n";
    }

    this.scoreListText = this.add.text(
      this.game.width / 2, this.game.height / 3,
      scoreString, 
      { font: '20px monospace', fill: '#fff', align: 'center' }
    );
    this.scoreListText.anchor.setTo(0.5, 0.5);
  },

  update: function () {

  }
}