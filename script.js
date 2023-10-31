class Player {
	constructor(game) {
		this.game = game;
		this.width = 100;
		this.height = 100;
		//& Placing the player in the bottom middle (half of the canvas width - offset 1/2 the player width)
		this.x = this.game.width * 0.5 - this.width * 0.5;
		//& Height of the game (canvas) - height of the player
		this.y = this.game.height - this.height;
		//& Move the player
		this.speed = 5; //? 5 pixels per second
	}

	draw(context) {
		context.fillRect(this.x, this.y, this.width, this.height);
	}
	update() {
		this.x += this.speed;
	}
}

class Projectile {}

class Enemy {}

class Game {
	constructor(canvas) {
		this.canvas = canvas;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		//& New instance of Player (this -> Player)
		this.player = new Player(this);
	}

	render(context) {
		this.player.draw(context);
		this.player.update();
	}
}

//& Load everything before the game starts
window.addEventListener('load', function () {
	const canvas = this.document.getElementById('canvas1');
	const ctx = canvas.getContext('2d');
	canvas.width = 1080;
	canvas.height = 1920;

	const game = new Game(canvas);

	//& Animate function
	function animate() {
		//? Clearing the canvas to see only the current animation
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		game.render(ctx);
		//? To create a loop it calls its parent function
		requestAnimationFrame(animate);
	}
	animate();
});
