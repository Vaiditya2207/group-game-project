const Player = require("../models/Player");
const Game = require("../models/Game");
const { v4: uuidv4 } = require("uuid");

class GameController {
  constructor(io) {
    this.io = io;
    this.game = new Game();
    this.startGameLoop();
  }

  handlePlayerJoin(socket, { username, role }) {
    if (role !== "civilian" && role !== "attacker") {
      socket.emit("error", { message: "Invalid role" });
      return;
    }

    const player = new Player(socket.id, username, role);
    this.game.addPlayer(player);

    socket.emit("joined", {
      id: player.id,
      position: player.position,
      role: player.role,
    });

    this.broadcastGameState();
    this.io.emit("playerJoined", {
      username: player.username,
      role: player.role,
    });
  }

  handlePlayerMove(socket, newPosition) {
    const player = this.game.getPlayer(socket.id);
    if (!player || !player.isAlive) return;

    if (
      newPosition.x < 0 ||
      newPosition.x > 1000 ||
      newPosition.y < 0 ||
      newPosition.y > 1000
    ) {
      return;
    }

    player.position = newPosition;

    if (player.role === "civilian") {
      socket.emit("positionUpdate", {
        id: player.id,
        position: player.position,
      });

      this.game.getAttackers().forEach((attacker) => {
        this.io.to(attacker.id).emit("positionUpdate", {
          id: player.id,
          position: player.position,
        });
      });
    }
  }

  handleAttack(socket, attackPosition) {
    const attacker = this.game.getPlayer(socket.id);

    if (!attacker || attacker.role !== "attacker") {
      return;
    }

    const target = this.game.findCivilianAtPosition(
      attackPosition.x,
      attackPosition.y,
      20
    );

    if (!target) {
      socket.emit("error", { message: "No civilian found at target position" });
      return;
    }

    attacker.addPoint();

    const isAlive = target.takeDamage();
    target.updatePosition();

    this.io.emit("playerAttacked", {
      attackerId: attacker.id,
      targetId: target.id,
      targetPoints: target.points,
      isAlive,
    });

    if (!isAlive) {
      this.io.emit("playerEliminated", {
        username: target.username,
      });
    }

    this.broadcastGameState();
  }

  handlePlayerDisconnect(socket) {
    const player = this.game.getPlayer(socket.id);
    if (player) {
      this.game.removePlayer(socket.id);
      this.io.emit("playerLeft", {
        username: player.username,
      });
      this.broadcastGameState();
    }
  }

  broadcastGameState() {
    const gameState = this.game.getGameState();
    this.io.emit("gameState", gameState);
  }

  startGameLoop() {
    setInterval(() => {
      if (this.game.isGameOver()) {
        const winners = this.game.getWinners();
        this.io.emit("gameOver", {
          winners: winners.map((w) => ({
            username: w.username,
            points: w.points,
          })),
        });
        this.game = new Game();
      }
    }, 1000);
  }
}

module.exports = GameController;
