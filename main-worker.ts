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
  Instrument
} from './src/app/interfaces/song.interface';



function loadSong(dir: string): Promise<Song> {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(dir), (err, data) => {
      if (err) {
        reject(err);
      } else {
        let parsed = new Midi(data)
        // Coerce @tonejs/midi formatted midi into our internal interface

        // _id and _rev are handled by the renderer process, not here.
        // They originate from the PoucHDB instance, but are included
        // on the interface for type checking.

        let name = parsed.header.name;
        if (!name || name == 'untitled')
          name = path.basename(dir, path.extname(dir));

        let midi: Song = {
          _id: '',
          _rev: '',
          Name: name,
          Path: path.resolve(dir),
          Duration: parsed.durationTicks,
          SelectedTrack: -1,
          Tracks: parsed.tracks.map((track: any) => {
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