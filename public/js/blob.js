function Blob (id, world, x, y) {
	this.id = id;
	this.heart = world.add.sprite(x, y, 'blob');
	this.heart.x = x;
	this.heart.y =y;
	world.physics.arcade.enable(this.heart);
	this.speed = 200;
	this.sight = 500;
	this.thoughtdelay = 100;
	this.dead = false;
	this.numGreenEaten = 0;
	this.numRedEaten = 0;
	this.actions = [0];
	for (var i = 1; i < 12; i++) {
		this.actions.push(this.actions[i - 1] + 2*Math.PI/12);
	}
	this.digesting = 0;
	this.direction = 0;
	this.previousDirection = 0;

	this.brain = new deepqlearn.Brain(2 + this.actions.length, this.actions.length);
	this.live = function () {
		var directionReward = -Math.abs(this.direction - this.previousDirection);
		var digestionReward = this.digesting;
		var boundsPunishment = this.getDistToWalls() < 50 ? -5 : 0;
		this.digesting = 0;
		var sumReward = directionReward + digestionReward + boundsPunishment;
		console.log("Sum reward: " + sumReward);
		this.brain.backward(sumReward);

		state = [this.heart.body.velocity.x, this.heart.body.velocity.y];
		for (var i = 0; i < this.actions.length; i++) {
			state.push(this.see(this.actions[i]));
		}
		var action = this.brain.forward(state);
		this.previousDirection = this.direction;
		this.direction = this.actions[action];
		this.heart.body.velocity.x = this.speed * Math.cos(this.direction);
		this.heart.body.velocity.y = this.speed * Math.sin(this.direction);
		setTimeout(this.live.bind(this), this.thoughtdelay);
		/* Choose an action (direction to move) */
	}

	this.getDistToWalls = function () {
		var closest = 1000;
		walls.forEach(function (wall) {
			closest = Math.min(sim.physics.arcade.distanceBetween(blob, wall) < 50);
		});
		return closest;
	}

	this.see = function (dir) {
		var ray = new Phaser.Line(this.heart.x, this.heart.y, 
									Math.cos(dir) * this.sight + this.heart.x, 
									Math.sin(dir) * this.sight + this.heart.y);
		var maxDistance = Number.POSITIVE_INFINITY;
		var closestIntersection = null;

		for (var k in items) {
			var f = items[k];
			var left = f.heart.x - f.heart.width * 0.5;
			var right = f.heart.x + f.heart.width * 0.5;
			var top = f.heart.y - f.heart.height * 0.5;
			var bottom = f.heart.y + f.heart.height * 0.5;


			var lines = [
				new Phaser.Line (left, top, left, bottom),
				new Phaser.Line (left, top, right, top),
				new Phaser.Line (right, bottom, left, bottom),
				new Phaser.Line (right, bottom, right, top)
			]

			for (var i = 0; i < lines.length; i++) {
				var intersect = Phaser.Line.intersects(ray, lines[i]);
				if (intersect) { 
					distance = sim.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);
					if (distance < maxDistance)  {
						maxDistance = distance;
						closestIntersection = f;
					}
				}
			}
		}
		var good = closestIntersection === null ? 0 : closestIntersection.good ? 1 : -1;
		return good;
	}

	this.consume = function (item) {
		if (item.good) {
			this.numGreenEaten += 1;
			document.getElementById("numgreen").innerHTML = "Number of Green Eaten: " + this.numGreenEaten;
			this.digesting += 10;
		}
		else {
			this.numRedEaten += 1;
			document.getElementById("numred").innerHTML = "Number of Red Eaten: " + this.numRedEaten;
			this.digesting -= 5;
		}
	}
}

function Item (id, world, x, y, good) {
	this.id = id;
	this.good = good;
	if (good) {
		this.heart = world.add.sprite(x, y, "gooditem");
	} else {
		this.heart = world.add.sprite(x, y, "baditem");
	}

	this.die = function () {
		this.heart.kill();
		delete items[this.id];
	}
}