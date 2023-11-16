import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SoundModule } from './sound/sound.module';

@Module({
  imports: [SoundModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
