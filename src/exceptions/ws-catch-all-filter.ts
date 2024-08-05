import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsCatchAllFilter implements ExceptionFilter {
  private readonly logger = new Logger(WsCatchAllFilter.name);

  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();

    this.logger.error(
      `WebGateway Exception: ${exception.message}`,
      exception.stack,
    );

    const errorResponse = {
      status: 'error',
      message: exception.message ?? 'An unexpected error occurred',
    };

    client.emit('exception', errorResponse);
  }
}
