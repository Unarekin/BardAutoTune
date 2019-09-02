"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { app, BrowserWindow, screen, session, } from 'electron';
var midi_1 = require("@tonejs/midi");
var path = require("path");
var fs = require("fs");
var readdir = require("readdir-enhanced");
function loadSong(dir) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path.resolve(dir), function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                var parsed = new midi_1.Midi(data);
                // Coerce @tonejs/midi formatted midi into our internal interface
                // _id and _rev are handled by the renderer process, not here.
                // They originate from the PoucHDB instance, but are included
                // on the interface for type checking.
                var name_1 = parsed.header.name;
                if (!name_1 || name_1 == 'untitled')
                    name_1 = path.basename(dir, path.extname(dir));
                var midi = {
                    _id: '',
                    _rev: '',
                    Name: name_1,
                    Path: path.resolve(dir),
                    Duration: parsed.durationTicks,
                    SelectedTrack: -1,
                    Tracks: parsed.tracks.map(function (track) {
                        return {
                            Name: (track.name ? track.name : track.instrument.name),
                            Channel: track.channel,
                            Notes: track.notes.map(function (note) {
                                return {
                                    Midi: note.midi,
                                    Time: note.time,
                                    Ticks: note.ticks,
                                    Name: note.name,
                                    Pitch: note.pitch,
                                    Octave: note.octave,
                                    Velocity: note.velocity,
                                    Duration: note.duration
                                };
                            }),
                            Instrument: {
                                Number: track.instrument.number,
                                Family: track.instrument.family,
                                Name: track.instrument.name,
                                Percussion: track.instrument.percussion
                            }
                        };
                    })
                };
                resolve(midi);
            }
        });
    });
}
function scanDir(dir) {
    return new Promise(function (resolve, reject) {
        readdir
            .stream(dir, { deep: true, filter: '*.mid' })
            .on('file', function (file) {
            // console.log(`Discovered: ${file}`);
            process.send({ type: 'song-discovered', path: path.resolve(path.join(dir, file)) });
        })
            .on('end', function () {
            // console.log("Scanning complete.");
            // process.send({type: 'task-complete', return: []});
            resolve();
        })
            .on('error', function (err) {
            // process.send({type: 'task-error', error: err});
            reject(err);
        })
            .resume();
    });
}
process.on('message', function (message) {
    // console.log("Worker received message: ", message);
    if (message.msg) {
        if (message.msg == 'task') {
            var task = message.task;
            // console.log("Task: ", task);
            if (task.cmd == 'song-scan') {
                scanDir(task.path)
                    .then(function () {
                    process.send({ type: 'task-success', response: [] });
                })
                    .catch(function (err) {
                    process.send({ type: 'task-error', error: err });
                });
            }
            if (task.cmd == 'song-load') {
                loadSong(task.path)
                    .then(function (song) {
                    // console.log("Returning: ", song);
                    process.send({ type: 'task-success', response: [song] });
                })
                    .catch(function (err) {
                    process.send({ type: 'task-error', error: err });
                });
            }
        }
    }
});
//# sourceMappingURL=main-worker.js.map