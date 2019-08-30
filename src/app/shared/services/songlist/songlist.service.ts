import { Injectable } from '@angular/core';
import { IPCService } from '../ipc/ipc.service';
import { Song } from '../../../interfaces/song.interface';

import * as path from 'path';


@Injectable({
  providedIn: 'root'
})
export class SonglistService {
  private _songs: any[] = [];

  private listPromise: Promise<string[]> = null;
  private songPromises: any = {};

  public get Songs(): any[] {
    return this._songs;
  }

  constructor(private ipc: IPCService) {
    this.Get = this.Get.bind(this);
    this.List = this.List.bind(this);
  }

  public List(force: boolean = false): Promise<string[]> {
    if (force || this.Songs.length == 0) {
      if (this.listPromise) {
        return this.listPromise;
      }

      this.listPromise = this.ipc.Send('song-list')
        .then((songs: string[]) => {
          this._songs = songs;
          this.listPromise = null;
          return songs;
        })
        ;

      // console.log("Promise: ", this.listPromise);
      return this.listPromise;
    } else {
      return Promise.resolve(this.Songs);
    }
  }

  public Get(song: string, force: boolean = false): Promise<Song> {
    let index = this.Songs.findIndex((elem) => elem.Name == song);
    if (force || index == -1 || !this.Songs[index]) {
      if (this.songPromises[song]) {
        return this.songPromises[song];
      } else {
        // console.log("Retrieving: ", song);
        this.songPromises[song] = this.ipc.Send('song', song)
          .then((item: any) => {
            // console.log(song, item);

            // if (!item.duration)
            //   item.Duration = Math.max.apply(Math, item.tracks.map((track) => Math.max.apply(Math, track.notes.map((note) => note.ticks + note.durationTicks))));

            // if (!item.Name)
            //   item.Name = path.basename(song, path.extname(song));

            // // console.log("Duration: ", item.duration);
            // item.Duration = item.duration;
            // item.Tracks = item.tracks;

            // delete item.duration;
            // delete item.tracks;

            console.log("Song: ", item);

            this.Songs[index] = item;
            delete this.songPromises[song];
            return item;
          })
          ;

        return this.songPromises[song];
      }
    } else {
      return Promise.resolve(this.Songs[index]);
    }

  }
}
