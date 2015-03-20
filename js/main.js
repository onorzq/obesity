var game = new Phaser.Game(800, 600, Phaser.AUTO, 'Obesity', { preload: preload, create: create , update: update});

function preload() {
    game.load.spritesheet('dude', 'imgs/dude.png', 32, 48);
    game.load.spritesheet('foods', 'imgs/foods.png', 33, 32,98,2);
    game.load.image('background', 'imgs/bg1.png');
}

var player;
var player_speed = 500;
var background;
var facing = 'left';
var cursors;
var food;
var dropingTimer = 0;
var score = 0;
var score_text;
var energy = 1000;
var energy_text;
var hiScore = 0;
var hiScore_text;
var stateText;
//var timeInterval = 100;

function create() {
    
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    // Background
    background = game.add.tileSprite(0, 0, game.width, game.height, 'background');
    
    // Food    
    foods = game.add.group();
    foods.enableBody = true;
    foods.physicsBodyType = Phaser.Physics.ARCADE;
    
    createFood();
    
    // Player   
    player = game.add.sprite(game.world.centerX, 600, 'dude');
    player.anchor.setTo(0.5, 0);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;
    //player.body.setSize(20, 32, 5, 16);
    player.scale.x = 2;
	player.scale.y = 2;

    // Player walking animations
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('turn', [4], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
            
    //game.camera.follow(player);

    // Game control
    cursors = game.input.keyboard.createCursorKeys();
    
    // Text display
	var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
    score_text = game.add.text( 0, 0, "Score: 0", style );
    energy_text = game.add.text( 0, score_text.height, "Energy: "+energy+"/1000", style );
    hiScore_text = game.add.text( 0, score_text.height+energy_text.height, "High Score: 0", style );
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;
}

function update() {

    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -player_speed;
        consumeEnergy();

        if (facing != 'left')
        {
            player.animations.play('left');
            facing = 'left';
        }
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = player_speed;
        consumeEnergy();

        if (facing != 'right')
        {
            player.animations.play('right');
            facing = 'right';
        }
    }
    else
    {
        if (facing != 'idle')
        {
            player.animations.stop();

            if (facing == 'left')
            {
                player.frame = 0;
            }
            else
            {
                player.frame = 5;
            }

            facing = 'idle';
        }
    }
    if (game.time.now > dropingTimer)
    {
        dropingfood();
    }
    
    // Collision
    game.physics.arcade.overlap(foods, player, eat, null, this);
}

function createFood(){
    for(i=0;i<98;i++){
        foods.create(game.world.randomX,0, 'foods',i);
    }
    foods.setAll('anchor.x', 0.5);
    foods.setAll('anchor.y', 1);
    foods.setAll('outOfBoundsKill', true);
    foods.setAll('checkWorldBounds', true);
}

function consumeEnergy(){
    // energy decreases corespond to player's moving speed
    energy -= Math.ceil(1000/player_speed);
    
    // display current energy
    energy_text.text = "Energy: " + energy + "/1000";
    
    // game over when energy goes to zero
    if(energy < 0){
        gameOver();
    }
}

function dropingfood(){
    // dropping food at random x coordinate, speed and time interval
    food = foods.getAt(game.rnd.integerInRange(0,97));
    food.reset(game.world.randomX,0);
    food.body.velocity.y = game.rnd.integerInRange(10,1000);
    dropingTimer = game.time.now + game.rnd.integerInRange(10,1000);
}

function eat(player,food){    
    // food disappear when being ate
    food.kill();
    
    // set and display the current score
    score += game.rnd.integerInRange(100,1000);
	score_text.text = "Score: " + score;
    
    // set and display the current energy
    energy += game.rnd.integerInRange(100,1000);
    if(energy > 1000){
        energy = 1000;        
    }
    energy_text.text = "Energy: " + energy + "/1000";
    
    // the player get fatter in appearance
    if(player.scale.x < 3){
        player.scale.x+=0.1;       
    }
    
    // slow down the speed as getting fatter
    if(player_speed > 50){
        player_speed-=10;
    }
}

function gameOver(){
    // kill player and all the food
    player.kill();
    foods.callAll('kill');

    stateText.text=" GAME OVER \n Click to restart";
    stateText.visible = true;
    
    // set and display high score if the current score beat the high score
    if(hiScore < score){
        hiScore = score;
    }
    hiScore_text.text = "High Score: " + hiScore;

    //the "click to restart" handler
    game.input.onTap.addOnce(restart,this);
}

function restart () {

    //  A new game starts
    foods.removeAll();
    createFood();
    
    // Reset the score and energy status
    score = 0;
    energy = 1000;
    score_text.text = "Score: " + score;
    energy_text.text = "Energy: " + energy + "/1000";

    // Revives the player   
    player.revive();
    player.scale.x=2;
    player_speed=500;
    
    // Hides the text
    stateText.visible = false;
}
