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

//! WAVE CLASS

class Wave {
	constructor(game) {
		this.game = game;
		this.width = this.game.columns * this.game.enemySize;
		this.height = this.game.rows * this.game.enemySize;
		this.x = 0;
		//? To move the wave of enemies out of the area (invisible)
		this.y = -this.height;
		this.speedX = 3;
		this.speedY = 0;
		this.enemies = [];
		this.create();
	}

	render(context) {
		//? Enemy wave quickly floats in from the top and starts bouncing
		if (this.y < 0) this.y += 5;
		this.speedY = 0;
		//context.strokeRect(this.x, this.y, this.width, this.height);

		//? Collison handling

		if (this.x < 0 || this.x > this.game.width - this.width) {
			this.speedX *= -1;
			this.speedY = this.game.enemySize;
		}
		if (this.y > this.game.height - this.height) {
			this.speedY *= -1;
		}
		this.x += this.speedX;
		this.y += this.speedY;
		this.enemies.forEach((enemy) => {
			enemy.update(this.x, this.y);
			enemy.draw(context);
		});
		//? Create a copy of the array and only allow elements inside with markedDeletion set to false
		//? and overrides the array

		this.enemies = this.enemies.filter((object) => !object.markedForDeletion);
	}

	create() {
		for (let y = 0; y < this.game.rows; y++) {
			for (let x = 0; x < this.game.columns; x++) {
				let enemyX = x * this.game.enemySize;
				let enemyY = y * this.game.enemySize;
				this.enemies.push(new Enemy(this.game, enemyX, enemyY));
			}
		}
	}
}

//! ENEMY CLASS

class Enemy {
	constructor(game, positionX, positionY) {
		this.game = game;
		this.width = this.game.enemySize;
		this.height = this.game.enemySize;
		this.x = 0;
		this.y = 0;
		this.positionX = positionX;
		this.positionY = positionY;
		this.markedForDeletion = false;
	}

	draw(context) {
		context.strokeRect(this.x, this.y, this.width, this.height);
	}

	update(x, y) {
		this.x = x + this.positionX;
		this.y = y + this.positionY;

		//? Check collision of enemies and projectiles

		this.game.projectilesPool.forEach((projectile) => {
			//* this = enemy
			if (!projectile.free && this.game.checkCollision(this, projectile)) {
				this.markedForDeletion = true;
				projectile.reset();
			}
		});
	}
}

//! GAME CLASS

class Game {
	constructor(canvas) {
		this.canvas = canvas;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.keys = [];

		//& New instance of Player (this -> Player)

		//? Enemies

		this.columns = 5;
		this.rows = 7;
		this.enemySize = 60;
		//this.enemy = new Enemy(this);
		this.player = new Player(this);

		//? Projectile

		this.projectilesPool = [];
		this.numberOfProjectiles = 20;
		this.createProjectiles();

		this.waves = [];
		this.waves.push(new Wave(this));

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
		//this.enemy.draw(context);
		this.projectilesPool.forEach((projectile) => {
			projectile.update();
			+projectile.draw(context);
		});
		this.waves.forEach((wave) => {
			wave.render(context);
		});
		//? Create a new wave
		if (this.waves.every((wave) => wave.enemies.length === 0)) {
			this.waves.push(new Wave(this));
		}
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

	//? Collison detection between 2 rectangles

	checkCollision(a, b) {
		return (
			a.x < b.x + b.width &&
			a.x + a.width > b.x &&
			a.y < b.y + b.height &&
			a.y + a.height > b.y
		);
	}
}

//& Load everything before the game starts
window.addEventListener('load', function () {
	const canvas = this.document.getElementById('canvas1');
	const ctx = canvas.getContext('2d');
	canvas.width = 1080;
	canvas.height = 1920;
	ctx.fillStyle = 'white';
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 5;

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
