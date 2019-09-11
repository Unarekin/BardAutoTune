import {
  Injectable,
} from '@angular/core';
import { EventEmitter } from 'events';

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
export class SongplayerService extends EventEmitter {
  private tracksPlaying: Track[] = [];
  private synthsPlaying: any[] = [];


  private trackEvents: any[] = [];

  constructor() {
    super();

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

    this.trackEvents.forEach(clearTimeout);
    this.trackEvents = [];
  }

  public PlayPreview(song: Song, track: Track): Promise<void> {
    return new Promise((resolve, reject) => {
      // console.log("Preview: ", track);

      if (this.tracksPlaying.length)
        this.stopTracks();

      this.emit('preview-start', {
        track: track,
        song: song
      });

      setTimeout(() => {
        // this.tracksPlaying.push(track);
        const now = Tone.now() + 0.5;

        const synth = new Tone.PolySynth(4, Tone.Synth, {
          envelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.3,
            release: 1
          }
        }).toMaster();

        track.Notes.forEach((note: Note) => {
          synth.triggerAttackRelease(note.Name, note.Duration, note.Time + now, note.Velocity);
          // this.trackEvents.push(setTimeout(() => {
          //   this.emit('preview-note', note);
          // }, note.Time));
        });

        let lastNote = track.Notes.reduce((prev, curr) => curr.Time + curr.Duration > prev.Time + prev.Duration ? curr : prev);

        this.trackEvents.push(setTimeout(() => {
          this.emit('preview-end');
          resolve();
        }, (lastNote.Time + lastNote.Duration) * 1000));


        this.synthsPlaying.push(synth);
        this.tracksPlaying.push(track);
      }, 0);
    });
  }

  // public PausePreview() {

  // }

  public StopPreview() {
    this.stopTracks();
    this.emit('preview-stopped');
  }

  // public ResumePreview() {

  // }

}
