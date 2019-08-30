import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { MatSort } from '@angular/material';
import { SonglistService } from '../../services';
import { BehaviorSubject, Observable } from 'rxjs';
import { merge } from 'rxjs/operators';

export class SongDataSource extends DataSource<any> {
  private songsSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading = this.loadingSubject.asObservable();

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

  public loadSongs(pageIndex: number, pageSize: number) {
    this.loadingSubject.next(true);

    // console.log("Loading songs: ", pageIndex, pageSize);

    let skip = (pageIndex * pageSize);
    let songs = this.songs.slice(skip, skip + pageSize);
    // console.log("Before slice: ", this.songs);
    // console.log("Sliced: ", songs);
    // console.log("Service: ", this.songlistService);
    // console.log("Sliced: ", songs);
    let promises = songs.map((song: string) => this.songlistService.Get(song));

    Promise.all(promises)
      .then((songs: any[]) => {
        // console.log("Loaded: ", songs);
        // songs.forEach((song) => { this.songsSubject.next(song)});
        this.songsSubject.next(songs);
        this.loadingSubject.next(false);
      })
      .catch(console.error)
      ;
  }

}