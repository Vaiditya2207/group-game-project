class Game {
  constructor() {
    this.players = new Map();
    this.gameStartTime = null;
    this.gameLength = 3 * 60 * 1000; 
    this.survivalTime = 30 * 1000; 
  }

  addPlayer(player) {
    this.players.set(player.id, player);
    if (this.gameStartTime === null && this.players.size > 1) {
      this.gameStartTime = Date.now();
    }
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  getAllPlayers() {
    return Array.from(this.players.values());
  }

  getCivilians() {
    return Array.from(this.players.values()).filter(
      (p) => p.role === "civilian" && p.isAlive
    );
  }

  getAttackers() {
    return Array.from(this.players.values()).filter(
      (p) => p.role === "attacker"
    );
  }

  findCivilianAtPosition(x, y, radius) {
    return this.getCivilians().find((civilian) => {
      const dx = civilian.position.x - x;
      const dy = civilian.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius;
    });
  }

  isGameOver() {
    if (!this.gameStartTime) return false;
    return Date.now() - this.gameStartTime >= this.gameLength;
  }

  getWinners() {
    const players = Array.from(this.players.values());
    const maxPoints = Math.max(...players.map((p) => p.points));
    return players.filter((p) => p.points === maxPoints);
  }

  getGameState() {
    return {
      timeRemaining: this.gameStartTime
        ? Math.max(0, this.gameLength - (Date.now() - this.gameStartTime))
        : this.gameLength,
      players: Array.from(this.players.values()).map((p) => ({
        id: p.id,
        username: p.username,
        role: p.role,
        points: p.points,
        isAlive: p.isAlive,
        position: p.role === "civilian" ? p.position : null,
      })),
    };
  }
}

module.exports = Game;