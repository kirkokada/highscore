
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {

  preload: function () {
    
  },

  create: function () {
    this.setupBackground();
    this.setupPlayer();
    this.setupEnemies();
    this.setupBullets();
    this.setupExplosions();
    this.setupText();
    this.setupPlayerIcons();
    this.setupAudio();

    this.cursors = this.input.keyboard.createCursorKeys();
  },

  //
  // create()-related functions
  //

    setupBackground: function() {
      this.sea = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'sea');
      this.sea.autoScroll(0, BasicGame.SEA_SCROLL_SPEED);
    },

    setupPlayer: function() {
      this.player = this.add.sprite(this.game.width / 2, this.game.height -50, 'player');
      this.player.anchor.setTo(0.5, 0.5);
      this.player.animations.add('fly', [0, 1, 2], 20, true);
      this.player.animations.add('ghost', [3, 0, 3, 1], 20, true);
      this.player.play('fly');
      this.physics.enable(this.player, Phaser.Physics.ARCADE);
      this.player.speed = BasicGame.PLAYER_SPEED;
      this.player.body.collideWorldBounds = true;
      this.player.body.setSize(20, 20, 0, -5);
      this.weaponLevel = 0;
    },

    setupPlayerIcons: function() {
      this.lives = this.add.group();
      // calculate location of first life icon
      var firstLifeIconX = this.game.width - 10 - (BasicGame.PLAYER_EXTRA_LIVES * 30);
      for (var i = 0; i < BasicGame.PLAYER_EXTRA_LIVES; i++) {
        var life = this.lives.create(firstLifeIconX + (30 * i), 30, 'player');
        life.scale.setTo(0.5, 0.5);
        life.anchor.setTo(0.5, 0.5);
      }

      this.powerUpPool = this.add.group();
      this.powerUpPool.enableBody = true;
      this.powerUpPool.physicsBodyType = Phaser.Physics.ARCADE;
      this.powerUpPool.createMultiple(5, 'powerup1');
      this.powerUpPool.setAll('anchor.x', 0.5);
      this.powerUpPool.setAll('anchor.y', 0.5)
      this.powerUpPool.setAll('outOfBoundsKill', true);
      this.powerUpPool.setAll('checkWorldBounds', true);
      this.powerUpPool.setAll(
        'reward', BasicGame.POWERUP_REWARD, false, false, 0, true
      );
    },

    setupBullets: function() {
      // Add an empty sprite group into our game
      this.bulletPool = this.add.group();

      // Enable physics to the whole sprite group
      this.bulletPool.enableBody = true;
      this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;

      // Add 100 'bullet' sprites in the group
      // By default this uses the first frame of the sprite sheet and
      //    sets the intial state as non-existing (i.e., killed/dead)
      this.bulletPool.createMultiple(100, 'bullet');

      // Sets anchors of all sprites
      this.bulletPool.setAll('anchor.x', 0.5);
      this.bulletPool.setAll('anchor.y', 0.5);

      // Automatically kill the bullet sprites when they go out of bounds
      this.bulletPool.setAll('outOfBoundsKill', true);
      this.bulletPool.setAll('checkWorldBounds', true);

      this.nextShotAt = 0;
      this.shotDelay = BasicGame.SHOT_DELAY;

      this.enemyBulletPool = this.add.group();

      this.enemyBulletPool.enableBody = true;
      this.enemyBulletPool.physicsBodyType = Phaser.Physics.ARCADE;
      this.enemyBulletPool.createMultiple(100, 'bullet');
      this.enemyBulletPool.setAll('anchor.x', 0.5);
      this.enemyBulletPool.setAll('anchor.y', 0.5)
      this.enemyBulletPool.setAll('outOfBoundsKill', true);
      this.enemyBulletPool.setAll('checkWorldBounds', true);
      this.enemyBulletPool.setAll('reward', 0, false, false, 0, true);
    },

    setupExplosions: function () {
      this.explosionPool = this.add.group();
      this.explosionPool.enableBody = true;
      this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
      this.explosionPool.createMultiple(100, 'explosion');
      this.explosionPool.setAll('anchor.x', 0.5);
      this.explosionPool.setAll('anchor.y', 0.5);
      this.explosionPool.forEach(function(explosion) {
        explosion.animations.add('boom');
      });
    },

    setupEnemies: function () {
      this.enemyPool = this.add.group();
      this.enemyPool.enableBody = true;
      this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
      this.enemyPool.createMultiple(50, 'greenEnemy');
      this.enemyPool.setAll('anchor.x', 0.5);
      this.enemyPool.setAll('anchor.y', 0.5);
      this.enemyPool.setAll('outOfBoundsKill', true);
      this.enemyPool.setAll('checkWorldBounds', true);
      this.enemyPool.setAll('reward', BasicGame.ENEMY_REWARD, false, false, 0, true);
      this.enemyPool.setAll(
        'dropRate', BasicGame.ENEMY_DROP_RATE, false, false, 0, true
      );

      // Set the animation for each sprite
      this.enemyPool.forEach(function(enemy) {
        enemy.animations.add('fly', [0, 1, 2], 20, true);
        enemy.animations.add('hit', [3, 1, 3, 2], 20, false);
        enemy.events.onAnimationComplete.add( function (e) {
          e.play('fly');
        }, this);
      });

      this.nextEnemyAt = 0;
      this.enemyDelay = BasicGame.SPAWN_ENEMY_DELAY;

      this.shooterPool = this.add.group();
      this.shooterPool.enableBody = true;
      this.shooterPool.physicsBodyType = Phaser.Physics.ARCADE;
      this.shooterPool.createMultiple(50, 'whiteEnemy');
      this.shooterPool.setAll('anchor.x', 0.5);
      this.shooterPool.setAll('anchor.y', 0.5);
      this.shooterPool.setAll('outOfBoundsKill', true);
      this.shooterPool.setAll('checkWorldBounds', true);
      this.shooterPool.setAll('reward', BasicGame.SHOOTER_REWARD, false, false, 0, true);
      this.shooterPool.setAll(
        'dropRate', BasicGame.SHOOTER_DROP_RATE, false, false, 0, true
      );

      this.shooterPool.forEach(function(shooter) {
        shooter.animations.add('fly', [0, 1, 2], 20, true);
        shooter.animations.add('hit', [3, 1, 3, 2], 20, false);
        shooter.events.onAnimationComplete.add( function (e) {
          e.play('fly');
        }, this);
      });

      this.nextShooterAt = this.time.now + Phaser.Timer.SECOND * 5;
      this.shooterDelay = BasicGame.SPAWN_SHOOTER_DELAY;

      this.bossPool = this.add.group();
      this.bossPool.enableBody = true;
      this.bossPool.physicsBodyType = Phaser.Physics.ARCADE;
      this.bossPool.createMultiple(1, 'boss');
      this.bossPool.setAll('anchor.x', 0.5);
      this.bossPool.setAll('anchor.y', 0.5);
      this.bossPool.setAll('outOfBoundsKill', true);
      this.bossPool.setAll('checkWorldBounds', true);
      this.bossPool.setAll('reward', BasicGame.BOSS_REWARD, false, false, 0, true);
      this.bossPool.setAll(
        'dropRate', BasicGame.BOSS_DROP_RATE, false, false, 0, true
      );

      // Set the animation for each sprite
      this.bossPool.forEach(function (enemy) {
        enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
        enemy.animations.add('hit', [ 3, 1, 3, 2 ], 20, false);
        enemy.events.onAnimationComplete.add( function (e) {
          e.play('fly');
        }, this);
      });

      this.boss = this.bossPool.getTop();
      this.bossApproaching = false;
    },

    setupText: function () {
      this.instructions = this.add.text(
        this.game.width / 2, 
        this.game.height - 100,
        'Use arrow keys to move, press Z to fire \n' +
        'Tapping/clicking does both',
        { font: '20px monospace', fill: '#fff', align: 'center' }
        );
      this.instructions.anchor.setTo(0.5, 0.5);
      this.instExpire = this.time.now + BasicGame.INSTRUCTION_EXPIRE;

      this.score = 0;
      this.scoreText = this.add.text(
        this.game.width / 2, 30, '' + this.score,
        { font: '20px monospace', fill: '#fff', align: 'center' }
      );
      this.scoreText.anchor.setTo(0.5, 0.5);
    },

    setupAudio: function () {
      this.explosionSFX = this.add.audio('explosion');
      this.playerExplosionSFX = this.add.audio('playerExplosion');
      this.enemyFireSFX = this.add.audio('enemyFire');
      this.playerFireSFX = this.add.audio('playerFire');
      this.powerUpSFX = this.add.audio('powerUp');
    },

  update: function () {
    this.checkCollisions();
    this.spawnEnemies();
    this.enemyFire();
    this.processPlayerInput();
    this.processDelayedEffects();
  },
  
  //
  // update()-related functions
  //

    checkCollisions: function () {
      this.physics.arcade.overlap(
        this.bulletPool, this.enemyPool, this.enemyHit, null, this
      );

      this.physics.arcade.overlap(
        this.player, this.enemyPool, this.playerHit, null, this
      );

      this.physics.arcade.overlap(
        this.player, this.shooterPool, this.playerHit, null, this
      );

      this.physics.arcade.overlap(
        this.player, this.enemyBulletPool, this.playerHit, null, this
      );

      this.physics.arcade.overlap(
        this.bulletPool, this.shooterPool, this.enemyHit, null, this
      );

      if (this.bossApproaching === false) {
        this.physics.arcade.overlap(
          this.bulletPool, this.bossPool, this.enemyHit, null, this
        );

        this.physics.arcade.overlap(
          this.player, this.bossPool, this.playerHit, null, this
        );
      }
      this.physics.arcade.overlap(
        this.player, this.powerUpPool, this.playerPowerUp, null, this
      );
    },

    spawnEnemies: function () {
      if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
        this.nextEnemyAt = this.time.now + this.enemyDelay;
        var enemy = this.enemyPool.getFirstExists(false);
        // spawn at a random location at the top of the screen
        enemy.reset(
          this.rnd.integerInRange(20, this.game.width-20), 0,
          BasicGame.ENEMY_HEALTH
          );
        // also randomize speed
        enemy.body.velocity.y = this.rnd.integerInRange(
          BasicGame.ENEMY_MIN_Y_VELOCITY, BasicGame.ENEMY_MAX_Y_VELOCITY);
        enemy.play('fly');
      }

      if (this.nextShooterAt < this.time.now && this.shooterPool.countDead() > 0) {
        this.nextShooterAt = this.time.now + this.shooterDelay;
        var shooter = this.shooterPool.getFirstExists(false);

        // spawn at a random location at the top of the screen
        shooter.reset(
          this.rnd.integerInRange(20, this.game.width - 20), 0,
          BasicGame.SHOOTER_HEALTH
        );

        // choose a random targe at the bottom
        var target = this.rnd.integerInRange(20, this.game.width - 20);

        // move to a target and rotate sprite accordingly

        shooter.rotation = this.physics.arcade.moveToXY(
          shooter, target, this.game.height,
          this.rnd.integerInRange(
            BasicGame.SHOOTER_MIN_VELOCITY, BasicGame.SHOOTER_MAX_VELOCITY
            )
          ) - Math.PI / 2;

        shooter.play('fly');
        shooter.nextShotAt = 0;
      }
    },

    enemyFire: function () {
      this.shooterPool.forEachAlive(function (enemy) {
        if (this.time.now > enemy.nextShotAt && this.enemyBulletPool.countDead() > 0) {
          var bullet = this.enemyBulletPool.getFirstExists(false);
          bullet.reset(enemy.x, enemy.y);
          this.physics.arcade.moveToObject(
            bullet, this.player, BasicGame.ENEMY_BULLET_VELOCITY
            );
          enemy.nextShotAt = this.time.now + BasicGame.SHOOTER_SHOT_DELAY;
          this.enemyFireSFX.play();
        }
      }, this);

      if (this.bossApproaching === false && this.boss.alive &&
          this.boss.nextShotAt < this.time.now &&
          this.enemyBulletPool.countDead() >= 10) 
      {
        this.boss.nextShotAt = this.time.now + BasicGame.BOSS_SHOT_DELAY;
        this.enemyFireSFX.play();

        for (var i = 0; i < 5; i++) {
          // process 2 bullets at a time
          var leftBullet = this.enemyBulletPool.getFirstExists(false);
          leftBullet.reset(this.boss.x - 10 - i * 10, this.boss.y + 20);
          var rightBullet = this.enemyBulletPool.getFirstExists(false);
          rightBullet.reset(this.boss.x - 10 + i * 10, this.boss.y +20);

          if (this.boss.health > BasicGame.BOSS_HEALTH / 2) {
            // aim directly at the player
            this.physics.arcade.moveToObject(
              leftBullet, this.player, BasicGame.ENEMY_BULLET_VELOCITY
            );
            this.physics.arcade.moveToObject(
              rightBullet, this.player, BasicGame.ENEMY_BULLET_VELOCITY
            );
          } else {
            // aim slightly off center of player
            this.physics.arcade.moveToXY(
              leftBullet, this.player.x - i * 100, this.player.y,
              BasicGame.ENEMY_BULLET_VELOCITY
            );
            this.physics.arcade.moveToXY(
              rightBullet, this.player.x + i * 100, this.player.y,
              BasicGame.ENEMY_BULLET_VELOCITY
            );
          }
        }
      }
    },

    processPlayerInput: function () {
      this.player.body.velocity.x = 0;
      this.player.body.velocity.y = 0;

      if (this.cursors.left.isDown) {
        this.player.body.velocity.x = -this.player.speed;
      } else if (this.cursors.right.isDown) {
        this.player.body.velocity.x = this.player.speed;
      } 

      if (this.cursors.up.isDown) {
        this.player.body.velocity.y = -this.player.speed;
      } else if (this.cursors.down.isDown) {
        this.player.body.velocity.y = this.player.speed;
      }

      if (this.input.activePointer.isDown && 
          this.physics.arcade.distanceToPointer(this.player) > 15) {
        this.physics.arcade.moveToPointer(this.player, this.player.speed);
      }

      if (this.input.keyboard.isDown(Phaser.Keyboard.Z) || 
          this.input.activePointer.isDown) {
        if (this.returnText && this.returnText.exists) {
          this.quitGame();
        } else {
          this.fire();
        }
      }
    },

    processDelayedEffects: function () {
      if (this.instructions.exists && this.time.now > this.instExpire) {
        this.instructions.destroy();
      }

      if (this.ghostUntil && this.ghostUntil < this.time.now) {
        this.ghostUntil = null;
        this.player.play('fly');
      }

      if (this.showReturn && this.showReturn < this.time.now) {
        this.returnText = this.add.text(
          this.game.width / 2, this.game.height / 2 - 60,
          'Press Z or tap/click to go back to main menu',
          { font: '16px sans-serif', fill: '#fff' }
          );
        this.returnText.anchor.setTo(0.5, 0.5);
        this.showReturn = false;
      }

      if (this.bossApproaching && this.boss.y > 80) {
        this.bossApproaching = false;
        this.boss.nextShotAt = 0;

        this.boss.body.velocity.y = 0;
        this.boss.body.velocity.x = BasicGame.BOSS_X_VELOCITY;
        this.boss.body.bounce.x = 1;
        this.boss.body.collideWorldBounds = true;
      }
    },

  fire: function () {
    if (!this.player.alive || this.nextShotAt > this.time.now) {
      return;
    }

    this.nextShotAt = this.time.now + this.shotDelay;
    this.playerFireSFX.play();

    
    var bullet;

    if (this.weaponLevel === 0) {
      if (this.bulletPool.countDead() === 0) {
        return;
      };
      bullet = this.bulletPool.getFirstExists(false);
      bullet.reset(this.player.x, this.player.y - 20);
      bullet.body.velocity.y = -BasicGame.BULLET_VELOCITY;
    } else {
      if (this.bulletPool.countDead() < this.weaponLevel *2) {
        return;
      };
      for (var i = 0; i < this.weaponLevel; i++) {
        bullet = this.bulletPool.getFirstExists(false);
        //spawn left bullet slightly left of center
        bullet.reset(this.player.x - (10 + i * 6), this.player.y - 20);
        // the left bullets spread from -95 to -135 degrees
        this.physics.arcade.velocityFromAngle(
          -95 - i * 10, BasicGame.BULLET_VELOCITY, bullet.body.velocity
        );

        bullet = this.bulletPool.getFirstExists(false);
        // spawn right bullet slightly right off center 
        bullet.reset(this.player.x + (10 + i * 6), this.player.y - 20); 
        // the right bullets spread from -85 degrees to -45 
        this.physics.arcade.velocityFromAngle(
          -85 + i * 10, BasicGame.BULLET_VELOCITY, bullet.body.velocity
        ); 
      };
    }
  },

  explode: function (sprite) {
    if (this.explosionPool.countDead() === 0) {
      return;
    }
    var explosion = this.explosionPool.getFirstExists(false);
    explosion.reset(sprite.x, sprite.y)
    explosion.play('boom', 15, false, true);
    // add the original sprite's velocity to the explosion
    explosion.body.velocity.x = sprite.body.velocity.x;
    explosion.body.velocity.y = sprite.body.velocity.y;
  },

  playerHit: function (player, enemy) {
    // check first if ghostUnitl is not undefined or null
    if (this.ghostUnitl && this.ghostUntil > this.time.now) {
      return;
    }
    // crashing into an enemy only deals 5 damage
    this.damageEnemy(enemy, BasicGame.CRASH_DAMAGE);
    var life = this.lives.getFirstAlive();
    if (life != null) {
      life.kill();
      this.ghostUntil = this.time.now + BasicGame.PLAYER_GHOST_TIME;
      this.player.play('ghost');
      this.weaponLevel = 0;
    } else {
      this.explode(player);
      this.playerExplosionSFX.play();
      player.kill();
      this.displayEnd(false);
    }
  },

  enemyHit: function (bullet, enemy) {
    bullet.kill();
    this.damageEnemy(enemy, BasicGame.BULLET_DAMAGE);
  },

  damageEnemy: function (enemy, damage) {
    enemy.damage(damage);
    if (enemy.alive) {
      enemy.play('hit');
    } else {
      this.explode(enemy);
      this.explosionSFX.play();
      this.spawnPowerUp(enemy);
      this.addToScore(enemy.reward);
      if (enemy.key === 'boss') {
        this.enemyPool.destroy();
        this.bossPool.destroy();
        this.enemyBulletPool.destroy();
        this.displayEnd(true);  
      }
    }
  },

  spawnPowerUp: function (enemy) {
    if (this.powerUpPool.coundDead === 0 || this.weaponLevel === 5) {
      return
    }

    if (this.rnd.frac() < enemy.dropRate) {
      var powerUp = this.powerUpPool.getFirstExists(false);
      powerUp.reset(enemy.x, enemy.y);
      powerUp.body.velocity.y = BasicGame.POWERUP_VELOCITY;
    }
  },

  playerPowerUp: function(player, powerUp) {
    this.addToScore(powerUp.reward);
    if (this.weaponLevel < 5) {
      powerUp.kill();
      this.powerUpSFX.play();
      this.weaponLevel++
    }
  },

  addToScore: function (score) {
    this.score += score;
    this.scoreText.text = this.score;
    if (this.score >= 10000 && this.bossPool.countDead() == 1) {
      this.spawnBoss();
    }
  },

  spawnBoss: function () {
    this.bossApproaching = true;
    this.boss.reset(this.game.width / 2, 0, BasicGame.BOSS_HEALTH);
    this.physics.enable(this.boss, Phaser.Physics.ARCADE);
    this.boss.body.velocity.y = BasicGame.BOSS_Y_VELOCITY;
    this.boss.play('fly');
  },

  displayEnd: function (win) {
    // you can't win and lose at the same time
    if (this.endText && this.endText.exists) {
      return;
    }

    var msg = win ? 'You Win!!!' : 'Game Over!';
    this.endText = this.add.text(
      this.game.width / 2, this.game.height / 2 - 60,
      msg,
      { font: '72px serif', fill: '#fff' }
      );
    this.endText.anchor.setTo(0.5, 0);
    this.showReturn = this.time.now + BasicGame.RETURN_MESSAGE_DELAY;
  },

  quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
    this.sea.destroy();
    this.player.destroy();
    this.enemyPool.destroy();
    this.bulletPool.destroy();
    this.explosionPool.destroy();
    this.instructions.destroy();
    this.scoreText.destroy();
    this.endText.destroy();
    this.returnText.destroy();

    //  Then let's go to the highscore screen.
    this.state.start('Highscores');

  }

};
