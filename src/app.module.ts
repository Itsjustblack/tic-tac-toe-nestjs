import { Logger, Module } from '@nestjs/common';
import { UuidModule } from 'nestjs-uuid';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameGateway } from './game/game.gateway';
import { AdminService } from './games/admin.service';

@Module({
  imports: [UuidModule],
  controllers: [AppController],
  providers: [AppService, GameGateway, AdminService, Logger],
})
export class AppModule {}
