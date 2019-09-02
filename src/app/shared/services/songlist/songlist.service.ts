import { EventEmitter } from 'events';
import { Injectable } from '@angular/core';
import { IPCService } from '../ipc/ipc.service';
import { DatabaseService } from '../database/database.service';
import {
  Song,
  Playlist,
  Track,
  Note,
  QueryResult
} from '../../../interfaces';

import * as path from 'path';


// export interface SongQuery {
//   Total: number,
//   Songs: Song[]
// };

// export interface PlaylistQuery {
//   Total: number,
//   Playlists: Playlist[]
// };


/**
 * A service to handle managing songs and playlists.
 */
@Injectable({
  providedIn: 'root'
})
export class SonglistService extends EventEmitter {
  constructor(private ipc: IPCService, private db: DatabaseService) {
    super();

    // Bindings
    this.FindPlaylist = this.FindPlaylist.bind(this);
    this.FindSong = this.FindSong.bind(this);
    this.ListPlaylists = this.ListPlaylists.bind(this);
    this.ListSongs = this.ListSongs.bind(this);
    this.LoadPlaylist = this.LoadPlaylist.bind(this);
    this.LoadSong = this.LoadSong.bind(this);
    this.RefreshSong = this.RefreshSong.bind(this);

    this.generateID = this.generateID.bind(this);

    this.ScanPath = this.ScanPath.bind(this);
    this.SongDiscovered = this.SongDiscovered.bind(this);
    this.SongError = this.SongError.bind(this);

    // IPC events
    this.ipc.on('song-discovered', this.SongDiscovered);
    this.ipc.on('song-error', this.SongError);
  }

  /**
   * Raised when a song is discovered, generally as part of a ScanPath call.
   */
  private SongDiscovered(song: Song) {
    // console.log("Song discovered: ", song);

    if (!song._id)
      song._id = this.generateID();

    this.db.Put('song', song);
    this.emit('song-discovered', song);
  }
  /**
   * Raised when loading a discovered song results in an error.
   */
  private SongError(err) { this.emit('song-error', err); }


  /**
   * Sends a scan request to the back end process.
   * Resolves once the folder has been scanned completely.
   * Will emit 'song-found' events when a song is found.
   */
  public ScanPath(dir: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.ipc.Send('song-scan', dir)
        .then(resolve)
        .catch(reject)
        ;
    });
  }

  /**
   * Will force load a song from disk.
   */
  public RefreshSong(id: string): Promise<Song> {
    let _rev: string = '';
    return this.LoadSong(id)
            .then((song: Song) => {
              // Retain revision for storing later.
              _rev = song._rev;
              return this.ipc.Send('song-load', song.Path)
            })
            .then((args: any[]) => {
              let song: Song = args[0];
              song._rev = _rev;
              // Always store in DB as no selected track.
              // This will get overridden elsewhere.
              song.SelectedTrack = -1;
              return this.db.Put('song', song);
            })
    // return this.ipc.Send('song-load', dir)
    //           .then((args) => {
    //             return args[0];
    //           });
  }

  public ListSongs(options: any = {}): Promise<QueryResult<Song>> { return this.db.Fetch('song', options); }
  public ListPlaylists(options: any = {}): Promise<QueryResult<Playlist>> { return this.db.Fetch('playlist', options); }
  public FindSong(query: any): Promise<QueryResult<Song>> { return this.db.Query('song', query); }

  public FindPlaylist(query: any): Promise<Playlist> {
    return this.db.Query<Playlist>('playlist', query)
            .then((res: QueryResult<Playlist>) => res.Results[0])
            ;
  }

  public LoadPlaylist(id: string): Promise<Playlist> { return this.db.Get('playlist', id); }
  public LoadSong(id: string): Promise<Song> { return this.db.Get('song', id); }

  public FindSongsInPlaylist(id: string): Promise<QueryResult<Song>> {
    return this.LoadPlaylist(id)
            .then((playlist: Playlist) => {
              return this.db.Query('song', {
                selector: {
                  "_id": {
                    "$in": playlist.Songs
                  }
                }
              })
            })
            // .then((result: QueryResult<Song>) => {
            //   return {
            //     Total: result.Total,
            //     Results: result.Results
            //   };
            // })
            ;
  }


  private generateID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}