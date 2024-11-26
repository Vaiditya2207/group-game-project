class Player {
  constructor(id, username, role) {
    this.id = id;
    this.username = username;
    this.role = role; 
    this.points = role === 'civilian' ? 5 : 0;
    this.position = this.getRandomPosition();
    this.lastMoveTime = Date.now();
    this.isAlive = true;
  }

  getRandomPosition() {
    return {
      x: Math.floor(Math.random() * 1000),
      y: Math.floor(Math.random() * 1000)
    };
  }

  updatePosition() {
    this.position = this.getRandomPosition();
    this.lastMoveTime = Date.now();
  }

  takeDamage() {
    this.points--;
    if (this.points <= 0) {
      this.isAlive = false;
    }
    return this.isAlive;
  }

  addPoint() {
    this.points++;
  }
}

module.exports = Player;