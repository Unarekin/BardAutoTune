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
                console.log("Loading: ", dir);
                var parsed_1 = new midi_1.Midi(data);
                // Coerce @tonejs/midi formatted midi into our internal interface
                // _id and _rev are handled by the renderer process, not here.
                // They originate from the PoucHDB instance, but are included
                // on the interface for type checking.
                // console.log("Duration: ", parsed.duration);
                var tempos_1 = parsed_1.header.tempos.map(function (tempo, index) {
                    var time = 0;
                    var duration = 0;
                    var durationTicks = 0;
                    durationTicks = (parsed_1.header.tempos.length - 1 > index) ? parsed_1.header.tempos[index + 1].ticks : parsed_1.duration;
                    duration = (60000 / (tempo.bpm * parsed_1.header.ppq)) * durationTicks;
                    time = (60000 / (tempo.bpm * parsed_1.header.ppq)) * tempo.ticks;
                    return {
                        BPM: tempo.bpm,
                        Ticks: tempo.ticks,
                        Time: time,
                        Duration: duration,
                        DurationTicks: durationTicks
                    };
                });
                // Default signature, if none specified.  4/4 time, the full length of the song.
                var defaultSignature = {
                    Ticks: 0,
                    Time: 0,
                    Duration: parsed_1.duration,
                    DurationTicks: parsed_1.durationTicks,
                    Signature: [4, 4]
                };
                // Default tempo, if none specified.  120 BPM, full length of hte song.
                var defaultTempo = {
                    BPM: 120,
                    Ticks: 0,
                    Time: 0,
                    Duration: parsed_1.duration,
                    DurationTicks: parsed_1.durationTicks
                };
                var midi = {
                    _id: '',
                    _rev: '',
                    Name: path.basename(dir, path.extname(dir)),
                    Path: path.resolve(dir),
                    Duration: parsed_1.duration,
                    SelectedTrack: -1,
                    PPQ: parsed_1.header.ppq,
                    Tempos: tempos_1.length == 0 ? [defaultTempo] : tempos_1,
                    OctaveShift: 0,
                    TimeSignatures: (parsed_1.header.timeSignatures.length == 0) ? [defaultSignature] : parsed_1.header.timeSignatures.map(function (elem, index) {
                        var time = 0;
                        var duration = 0;
                        var durationTicks = 0;
                        // Find current tempo.
                        var currentTempo = tempos_1.filter(function (tempo) { return tempo.Ticks <= elem.ticks; }).sort(function (a, b) { return b.Ticks - a.Ticks; })[0];
                        if (!currentTempo) {
                            currentTempo = {
                                BPM: 120,
                                Ticks: 0,
                                Time: 0,
                                Duration: parsed_1.duration,
                                DurationTicks: parsed_1.durationTicks
                            };
                        }
                        // durationTicks = (parsed.header.timeSignatures.length >= index+1) ? parsed.header.timeSignatures[index+1].ticks : parsed.duration;
                        durationTicks = (parsed_1.header.timeSignatures.length - 1 > index) ? parsed_1.header.timeSignatures[index + 1].ticks : parsed_1.duration;
                        duration = (60000 / (currentTempo.BPM * parsed_1.header.ppq)) * durationTicks;
                        time = (60000 / (currentTempo.BPM * parsed_1.header.ppq)) * elem.ticks;
                        return {
                            Ticks: elem.ticks,
                            Time: time,
                            Duration: duration,
                            DurationTicks: durationTicks,
                            Signature: elem.timeSignature
                        };
                    }),
                    Tracks: parsed_1.tracks.filter(function (track) { return track.notes.length; }).map(function (track) {
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