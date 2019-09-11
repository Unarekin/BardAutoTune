// import { app, BrowserWindow, screen, session, } from 'electron';
import { Midi } from '@tonejs/midi';

import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as readdir from 'readdir-enhanced';
import * as cluster from 'cluster'


import {
  Song,
  Track,
  Note,
  Instrument,
  TimeSignature,
  Tempo
} from './src/app/interfaces/song.interface';



function loadSong(dir: string): Promise<Song> {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(dir), (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log("Loading: ", dir);
        let parsed = new Midi(data)
        // Coerce @tonejs/midi formatted midi into our internal interface

        // _id and _rev are handled by the renderer process, not here.
        // They originate from the PoucHDB instance, but are included
        // on the interface for type checking.
        // console.log("Duration: ", parsed.duration);

        let tempos: Tempo[] = parsed.header.tempos.map((tempo: any, index: number): Tempo => {
          let time: number = 0;
          let duration: number = 0;
          let durationTicks: number = 0;

          durationTicks = (parsed.header.tempos.length-1 > index) ? parsed.header.tempos[index+1].ticks : parsed.duration;
          duration = (60000 / (tempo.bpm * parsed.header.ppq)) * durationTicks;
          time = (60000 / (tempo.bpm * parsed.header.ppq)) * tempo.ticks;

          return {
            BPM: tempo.bpm,
            Ticks: tempo.ticks,
            Time: time,
            Duration: duration,
            DurationTicks: durationTicks
          }
        });

        // Default signature, if none specified.  4/4 time, the full length of the song.
        let defaultSignature: TimeSignature = {
          Ticks: 0,
          Time: 0,
          Duration: parsed.duration,
          DurationTicks: parsed.durationTicks,
          Signature: [4,4]
        };

        // Default tempo, if none specified.  120 BPM, full length of hte song.
        let defaultTempo: Tempo = {
          BPM: 120,
          Ticks: 0,
          Time: 0,
          Duration: parsed.duration,
          DurationTicks: parsed.durationTicks
        };

        let midi: Song = {
          _id: '',
          _rev: '',
          Name: path.basename(dir, path.extname(dir)),
          Path: path.resolve(dir),
          Duration: parsed.duration,
          SelectedTrack: -1,
          PPQ: parsed.header.ppq,
          Tempos: tempos.length == 0 ? [defaultTempo] : tempos,
          OctaveShift: 0,
          TimeSignatures: (parsed.header.timeSignatures.length == 0) ? [defaultSignature] : parsed.header.timeSignatures.map((elem: any, index: number): TimeSignature => {
            let time: number = 0;
            let duration: number = 0;
            let durationTicks: number = 0;


            // Find current tempo.
            let currentTempo = tempos.filter((tempo: Tempo) => tempo.Ticks <= elem.ticks).sort((a: Tempo, b: Tempo) => b.Ticks - a.Ticks)[0];
            if (!currentTempo) {
              currentTempo = {
                BPM: 120,
                Ticks: 0,
                Time: 0,
                Duration: parsed.duration,
                DurationTicks: parsed.durationTicks
              };
            }
            // durationTicks = (parsed.header.timeSignatures.length >= index+1) ? parsed.header.timeSignatures[index+1].ticks : parsed.duration;
            durationTicks = (parsed.header.timeSignatures.length-1 > index) ? parsed.header.timeSignatures[index+1].ticks : parsed.duration;
            duration = (60000  / (currentTempo.BPM * parsed.header.ppq)) * durationTicks;
            time = (60000 / ( currentTempo.BPM * parsed.header.ppq)) * elem.ticks;

            return {
              Ticks: elem.ticks,
              Time: time,
              Duration: duration,
              DurationTicks: durationTicks,
              Signature: elem.timeSignature
            };
          }),
          Tracks: parsed.tracks.filter((track: any) => track.notes.length).map((track: any) => {
            return {
              Name: (track.name ? track.name : track.instrument.name),
              Channel: track.channel,
              Notes: track.notes.map((note: any) => {
                return {
                  Midi: note.midi,
                  Time: note.time,
                  Ticks: note.ticks,
                  Name: note.name,
                  Pitch: note.pitch,
                  Octave: note.octave,
                  Velocity: note.velocity,
                  Duration: note.duration
                }
              }),
              Instrument: {
                Number: track.instrument.number,
                Family: track.instrument.family,
                Name: track.instrument.name,
                Percussion: track.instrument.percussion
              }
            }
          })
        };

        resolve(midi);
      }
    });
  })
}



function scanDir(dir: string): Promise<void> {
  return new Promise((resolve, reject) => {

    readdir
      .stream(dir, {deep: true, filter: '*.mid'})
      .on('file', (file: string) => {
        // console.log(`Discovered: ${file}`);
        process.send({type: 'song-discovered', path: path.resolve(path.join(dir, file))});
      })
      .on('end', () => {
        // console.log("Scanning complete.");
        // process.send({type: 'task-complete', return: []});
        resolve();
      })
      .on('error', (err) => {
        // process.send({type: 'task-error', error: err});
        reject(err);
      })
      .resume();
  });
}

process.on('message', (message: any) => {
  // console.log("Worker received message: ", message);

  if (message.msg) {
    if (message.msg == 'task') {
      let task = message.task;

      // console.log("Task: ", task);
      
      if (task.cmd == 'song-scan') {
        scanDir(task.path)
          .then(() => {
            process.send({type: 'task-success', response: []});
          })
          .catch((err) => {
            process.send({type: 'task-error', error: err});
          });
      }

      if (task.cmd == 'song-load') {
        loadSong(task.path)
          .then((song: Song) => {
            // console.log("Returning: ", song);
            process.send({type: 'task-success', response: [song]});
          })
          .catch((err) => {
            process.send({type: 'task-error', error: err});
          });
      }

    }
  }
});