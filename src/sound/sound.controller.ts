import { Controller, Get, Post, Body } from '@nestjs/common';
import { SoundService } from './sound.service';

@Controller('sound')
export class SoundController {
  constructor(private readonly soundService: SoundService) {}

  @Get('tracks')
  GetAllTracks() {
    return this.soundService.getAllTracks();
  }

  @Post('tracks')
  addTrack(@Body() trackData: any) {
    return this.soundService.addTrack(trackData);
  }
}
