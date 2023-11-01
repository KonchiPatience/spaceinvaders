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
		this.speed = 10; //? 5 pixels per second
	}

	draw(context) {
		context.fillRect(this.x, this.y, this.width, this.height);
	}
	update() {
		//? Horizontal movement

		if (this.game.keys.indexOf('ArrowLeft') > -1) this.x -= this.speed;
		if (this.game.keys.indexOf('ArrowRight') > -1) this.x += this.speed;

		//* Horizontal boundaries

		if (this.x < -this.width * 0.5) {
			this.x = -this.width * 0.5;
		} else if (this.x > this.game.width - this.width * 0.5)
			this.x = this.game.width - this.width * 0.5;

		//? Vertical movement

		if (this.game.keys.indexOf('ArrowUp') > -1) this.y -= this.speed;
		if (this.game.keys.indexOf('ArrowDown') > -1) this.y += this.speed;
	}
	shoot() {
		const projectile = this.game.getProjectile();

		//? Activate available projectile, shoot from the middle of the player

		if (projectile)
			projectile.start(this.x + this.width * 0.5, this.y + this.width * 0.5);
	}
}

//! Projectile class (Object pool member)

class Projectile {
	constructor() {
		this.width = 8;
		this.height = 20;
		this.x = 0;
		this.y = 0;
		this.speed = 20;
		this.free = true; //? projectile sitting in the pool ready to be used
	}
	draw(context) {
		if (!this.free) {
			context.fillRect(this.x, this.y, this.width, this.height);
		}
	}

	update() {
		if (!this.free) {
			this.y -= this.speed;
			//? If the projectile flies out of area -> reset
			if (this.y < 0 - this.height) this.reset();
		}
	}
	//? Runs when the object is taken from the object pool
	start(x, y) {
		this.x = x - this.width * 0.5; //* to place projectile in perfect middle
		this.y = y;
		this.free = false;
	}

	//? Runs when the object no longer needed and it's returned to the pool
	reset() {
		this.free = true;
	}
}

class Enemy {}

class Game {
	constructor(canvas) {
		this.canvas = canvas;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.keys = [];
		//& New instance of Player (this -> Player)
		this.player = new Player(this);

		//? Projectile

		this.projectilesPool = [];
		this.numberOfProjectiles = 20;
		this.createProjectiles();
		console.log(this.projectilesPool);

		//? Event listeners

		//& Keyboard controls

		window.addEventListener('keydown', (e) => {
			//? arrow functions inherit this keyword
			e.preventDefault;
			if (this.keys.indexOf(e.key) === -1) this.keys.push(e.key);
			if (e.key === ' ') this.player.shoot();
		});

		window.addEventListener('keyup', (e) => {
			e.preventDefault;
			const index = this.keys.indexOf(e.key);
			if (index > -1) this.keys.splice(index, 1);
		});
	}

	render(context) {
		this.player.draw(context);
		this.player.update();
		this.projectilesPool.forEach((projectile) => {
			projectile.update();
			+projectile.draw(context);
		});
	}

	//? Create projectiles object pool

	createProjectiles() {
		for (let i = 0; i < this.numberOfProjectiles; i++) {
			this.projectilesPool.push(new Projectile());
		}
	}

	//? Get free projectile object from the pool

	getProjectile() {
		for (let i = 0; i < this.projectilesPool.length; i++) {
			if (this.projectilesPool[i].free) return this.projectilesPool[i];
		}
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
