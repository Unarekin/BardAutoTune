import {
  Injectable
} from '@angular/core';

import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';

import {
  Song,
  Track,
  Note
} from '../../../interfaces';


@Injectable({
  providedIn: 'root'
})
export class SongplayerService {
  private tracksPlaying: Track[];
  private synthsPlaying: any[];


  constructor() {

    // Bindings
    this.PlayPreview = this.PlayPreview.bind(this);
    // this.PausePreview = this.PausePreview.bind(this);
    this.StopPreview = this.StopPreview.bind(this);
    // this.ResumePreview = this.ResumePreview.bind(this);

    this.stopTracks = this.stopTracks.bind(this);
  }


  private stopTracks() {
    this.synthsPlaying.forEach((synth: any) => {
      synth.dispose();
    });
    this.synthsPlaying=[];
    this.tracksPlaying=[];
  }

  public PlayPreview(track: Track): Promise<void> {
    return new Promise((resolve, reject) => {

      if (this.tracksPlaying.length) {

      }

      this.tracksPlaying.push(track);
      const now = Tone.now() + 0.5;

      const synth = new Tone.PolySynth(1, Tone.Synth, {
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 1
        }
      }).toMaster();

      track.Notes.forEach((note: Note) => {
        synth.triggerAttackRelease(note.Name, note.Duration, note.Time + now, note.Velocity);
      });


      this.synthsPlaying.push(synth);
      this.tracksPlaying.push(track);
    });
  }

  // public PausePreview() {

  // }

  public StopPreview() {

  }

  // public ResumePreview() {

  // }

}
