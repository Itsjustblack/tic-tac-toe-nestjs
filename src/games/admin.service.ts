import { Injectable, Logger } from '@nestjs/common';
import { Game } from 'src/game/game.entity';

@Injectable()
export class AdminService {
  admin: { [room: string]: Game | null } = {}; // Relates rooms to Games
  rooms: { [room: string]: Set<String> } = {}; // Relates Rooms to Players

  constructor(private readonly logger: Logger) {}

  createRoom(room: string, clientId: string) {
    this.rooms = { ...this.rooms, [room]: new Set([clientId]) };
    this.logger.log('New Room Created');
  }

  joinRoom(room: string, clientId: string) {
    if (this.rooms.hasOwnProperty(room)) {
      if (this.rooms[room].size < 2) {
        this.rooms[room].add(clientId);
        this.logger.log('Joined Room');
      } else throw new Error('Room is Full');
    } else throw new Error('Room not Found');
  }

  // Didnt Test: Prayers!!!!
  removeUser(clientId: string) {
    const allRooms = Object.keys(this.rooms);
    allRooms.forEach((room) => {
      const clients = [...this.rooms[room]];
      if (clients.includes(clientId)) {
        if (!this.rooms[room].delete(clientId))
          throw new Error('Client Doesnt Exist');
      } else return;
    });
  }

  createGame(room: string) {
    this.admin = { ...this.admin, [room]: new Game() };
    this.logger.log('New Game Created');
    return this.admin[room].board;
  }

  updateBoard({ room, position, player }) {
    return this.getGame(room).updateBoard(position, player);
  }

  getWinner(room: string) {
    return this.getGame(room).getWinner();
  }

  updateScore(room: string) {
    return this.getGame(room).updateScore();
  }

  deleteRoom(room: string) {
    try {
      delete this.admin[room];
      delete this.rooms[room];
    } catch (error) {
      throw new Error(`No game found for room ${room}`);
    }
  }

  nextRound(room: string) {
    return this.getGame(room).nextRound();
  }

  getGame(room: string) {
    if (!this.admin[room]) {
      throw new Error(`No game found for room ${room}`);
    }

    return this.admin[room];
  }
}
