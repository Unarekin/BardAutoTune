import { expect, should, assert } from 'chai';
import { Midi } from '@tonejs/midi';
import * as fs from 'fs';
import * as path from 'path';

describe("MIDI", () => {
  it("Can load MIDI", (done) => {
    fs.readFile(path.resolve(path.join(__dirname, "./sample.mid")), (err, data) => {
      if (err) {
        throw err;
      } else {
        let parsed = new Midi(data)
        assert.isOk(parsed);
        fs.writeFileSync(path.join(__dirname, 'midi.json'), JSON.stringify(parsed));
        done();
      }
    });
  });
});