// import { expect, should, assert } from 'chai';
// // import { Midi } from '@tonejs/midi';
// import * as fs from 'fs';
// import * as path from 'path';
// import * as util from 'util';
// import { Spinner } from 'cli-spinner';

// import * as mm from '@magenta/music/node/music_rnn';
// import * as core from '@magenta/music/node/core';

// const writeFile = util.promisify(fs.writeFile);
// const MIN_PITCH = 48;
// const MAX_PITCH = 83;

// const modelUrl = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn";
// const rnnSteps: number = 1000;
// const rnnTemperature: number = 1.0;

// const globalAny: any = global;
// globalAny.performance = Date;
// globalAny.fetch = require('node-fetch');


// describe("Magenta", () => {
//   let spinner: Spinner = null;

//   it('Generates new sequence', (done) => {
//     let rnn = new mm.MusicRNN(modelUrl);
//     rnn.initialize()
//       .then(() => loadMidi(path.join(__dirname, 'sample.mid')))
//       .then((loaded) => core.midiToSequenceProto(loaded))
//       .then((sequence) => {
//         let filtered = Object.assign({}, sequence);
//         filtered.notes = filtered.notes.filter((note) => note.pitch >= MIN_PITCH && note.pitch <= MAX_PITCH);
//         let quantized = core.sequences.quantizeNoteSequence(filtered, 4);

//         spinner = new Spinner('Generating %s');
//         spinner.start();

//         return rnn.continueSequence(quantized, rnnSteps, rnnTemperature);
//       })
//       .then((generated) => {
//         spinner.stop(true);
//         let midi = core.sequenceProtoToMidi(generated);
//         return writeFile(path.join(__dirname, 'generated.mid'), midi);

//       })
//       .then(done)
//       .catch(done);
//   });
// });


// function loadMidi(file: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     fs.readFile(file, 'binary', (err, data) => {
//       if (err)
//         reject(err);
//       else
//         resolve(data);
//     });
//   });
// }