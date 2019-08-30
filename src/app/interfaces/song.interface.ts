export interface Song {
  Name: string,
  Duration: number,
  Tracks: Track[]
};

export interface Track {
  Name: string,
  Channel: number,
  Notes: Note[],
  Instrument: Instrument
};

export interface Note {
  Midi: number,
  Time: number,
  Ticks: number,
  Name: string,
  Pitch: string,
  Octave: number,
  Velocity: number,
  Duration: number
};

export interface Instrument {
  Number: number,
  Family: string,
  Name: string,
  Percussion: boolean
};