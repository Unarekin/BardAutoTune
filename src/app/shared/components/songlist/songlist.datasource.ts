import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { MatSort } from '@angular/material';
import { SonglistService } from '../../services';
import { BehaviorSubject, Observable } from 'rxjs';
import { merge } from 'rxjs/operators';

import { Song, Playlist, QueryResult } from '../../../interfaces';

export class SongDataSource extends DataSource<Song> {
  private songsSubject = new BehaviorSubject<Song[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private totalSubject = new BehaviorSubject<number>(0);
  private songPage = new BehaviorSubject<Song[]>([]);

  // public loading: Observable<boolean> = this.loadingSubject.asObservable();
  public get Loading(): Observable<boolean> { return this.loadingSubject.asObservable(); }
  public get TotalCount(): Observable<number> { return this.totalSubject.asObservable(); }
  public get Songs(): Observable<Song[]> { return this.songsSubject.asObservable(); }
  public get SongPage(): Observable<Song[]> { return this.songPage.asObservable(); }


  // private songs: string[] = [];
  
  public sort: ((data: any[], sort: MatSort) => any[]) = null;


  constructor(private songlistService: SonglistService, private songs: string[] = []) {
    super();
  }


  public connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this.songsSubject.asObservable();
  }

  public disconnect(collectionViewer: CollectionViewer): void {
    this.songsSubject.complete();
    this.loadingSubject.complete();
  }

  public setSongs(songs: string[]) {
    // console.log("Setting songs: ", songs);
    this.songs = songs;
  }

  public loadSongs(pageIndex: number, pageSize: number, playlist: Playlist = null) {
    // console.log("Loading; ", arguments);
    this.loadingSubject.next(true);
    let skip = (pageIndex * pageSize);
    // let songs = this.songs.slice(skip, skip + pageSize);

    // console.log("Loading songs: ", pageIndex, pageSize, skip);

    if (playlist) {
      this.songlistService
    }

    this.songlistService.ListSongs({
      limit: pageSize,
      skip: skip
    })
    .then((result: QueryResult<Song>) => {
      // console.log("Result: ", result);
      this.songsSubject.next(result.Results);
      this.loadingSubject.next(false);
      this.totalSubject.next(result.Total);
    })
    .catch(console.error)
    ;

    // this.loadingSubject.next(true);

    // // console.log("Loading songs: ", pageIndex, pageSize);

    // let skip = (pageIndex * pageSize);
    // let songs = this.songs.slice(skip, skip + pageSize);
    // // console.log("Before slice: ", this.songs);
    // // console.log("Sliced: ", songs);
    // // console.log("Service: ", this.songlistService);
    // // console.log("Sliced: ", songs);
    // let promises = songs.map((song: string) => this.songlistService.Get(song));

    // Promise.all(promises)
    //   .then((songs: any[]) => {
    //     // console.log("Loaded: ", songs);
    //     // songs.forEach((song) => { this.songsSubject.next(song)});
    //     this.songsSubject.next(songs);
    //     this.loadingSubject.next(false);
    //   })
    //   .catch(console.error)
    //   ;
  }

}