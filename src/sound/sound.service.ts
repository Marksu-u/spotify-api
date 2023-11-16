import { Injectable } from '@nestjs/common';

@Injectable()
export class SoundService {
  private tracks: any[] = [];

  getAllTracks() {
    return this.tracks;
  }

  addTrack(trackData: any) {
    this.tracks.push(trackData);
    return 'Audio ajouté avec succès.';
  }
}
