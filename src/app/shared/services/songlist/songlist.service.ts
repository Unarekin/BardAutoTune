import { EventEmitter } from 'events';
import { Injectable } from '@angular/core';
import { IPCService } from '../ipc/ipc.service';
import { DatabaseService } from '../database/database.service';
import { Song, Playlist, Track, Note } from '../../../interfaces/song.interface';

import * as path from 'path';


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
  private SongDiscovered(song: Song) { this.emit('song-discovered', song); }
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
    return this.LoadSong(id)
    return this.ipc.Send('song-load', dir)
              .then((args) => {
                return args[0];
              });
  }

  public ListSongs(): Promise<Song[]> { return this.db.Fetch('song'); }
  public ListPlaylists(): Promise<Playlist[]> { return this.db.Fetch('playlist'); }
  public FindSong(query: any): Promise<Song[]> { return this.db.Query('song', query); }
  public FindPlaylist(query: any): Promise<Playlist> { return this.db.Query('playlist', query); }
  public LoadPlaylist(id: string): Promise<Playlist> { return this.db.Get('playlist', id); }
  public LoadSong(id: string): Promise<Song> { return this.db.get('song', id); }
}
