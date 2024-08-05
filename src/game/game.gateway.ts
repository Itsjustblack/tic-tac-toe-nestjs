import { Logger, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { UuidService } from 'nestjs-uuid';
import { Server, Socket } from 'socket.io';
import { WsCatchAllFilter } from 'src/exceptions/ws-catch-all-filter';
import { AdminService } from 'src/games/admin.service';
import { IPlayer } from 'src/interfaces/game.interface';

//  Handle JSON DataTransfer. Not Recieving Message from Postman

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseFilters(WsCatchAllFilter)
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(GameGateway.name);

  @WebSocketServer() io: Server;

  constructor(
    private readonly uuidService: UuidService,
    private readonly adminService: AdminService,
  ) {}

  afterInit() {
    this.logger.log('Initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    const { sockets } = this.io.sockets;

    this.logger.log(`Client id: ${client.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  handleDisconnect(client: any) {
    this.adminService.removeUser(client.id);
    this.logger.log(`Cliend id:${client.id} disconnected`);
  }

  @SubscribeMessage('create_room')
  createRoom(@ConnectedSocket() client: Socket) {
    const newRoom = this.uuidService.generate().substring(0, 10);
    this.adminService.createRoom(newRoom, client.id);
    client.join(newRoom);
    client.emit('room_created', newRoom);
  }

  @SubscribeMessage('join_room')
  joinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    try {
      this.adminService.joinRoom(room, client.id);
      client.join(room);
      const newBoard = this.adminService.createGame(room);
      this.io.to(room).emit('new_game', newBoard);
    } catch (err) {
      throw new WsException(err);
    }
  }

  @SubscribeMessage('player_moved')
  updateBoard(
    @MessageBody()
    payload: {
      room: string;
      position: number;
      player: string;
    },
  ) {
    try {
      const newBoard = this.adminService.updateBoard(payload);
      this.io.to(payload.room).emit('update_board', newBoard);
      this.checkWinner(payload.room);
    } catch (err) {
      throw new WsException(err);
    }
  }

  checkWinner(room: string) {
    const { winner, pattern } = this.adminService.getWinner(room);
    if (winner !== null) {
      const scores = this.adminService.updateScore(room);
      this.io.to(room).emit('game_won', winner, pattern, scores);
    }
  }

  @SubscribeMessage('end_game')
  endGame(@MessageBody() room: string) {
    try {
      this.adminService.deleteRoom(room);
      this.io.to(room).emit('game_over');
      this.io.socketsLeave(room);
    } catch (err) {
      throw new WsException(err);
    }
  }

  @SubscribeMessage('next_round')
  nextRound(@MessageBody() room: string) {
    try {
      const round = this.adminService.nextRound(room);
      this.io.to(room).emit('new_round', round);
    } catch (err) {
      throw new WsException(err);
    }
  }
}
