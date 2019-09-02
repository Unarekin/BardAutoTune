import {
  Component,
  OnInit,
  AfterViewInit,
  OnChanges,
  Input,
  ViewChild,
  SimpleChanges,
  SimpleChange
} from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { tap } from 'rxjs/operators';
import { Playlist, Song, Track } from '../../../interfaces';

import * as path from 'path';

import {
  faPlay,
  faSync,
  faStop
} from '@fortawesome/free-solid-svg-icons';

import { SonglistService, SongplayerService } from '../../services/';
import { SongDataSource } from './songlist.datasource';

@Component({
  selector: 'app-songlist',
  templateUrl: './songlist.component.html',
  styleUrls: ['./songlist.component.scss']
})
export class SonglistComponent implements OnInit, OnChanges, AfterViewInit {
  // @Input() public songs: any[] = [];
  // @Input() public songs: string[] = [];
  @Input() public playlist: Playlist = null;
  @Input() displayedColumns: string[] = ["Name", "Track", "Duration", "Actions"];
  @ViewChild('table', { static: true}) private table: any = null;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;


  public Icons: any = {
    Refresh: faSync,
    Play: faPlay,
    Stop: faStop
  };

  public dataSource: SongDataSource = new SongDataSource(this.songList);
  public SongCount: number = 0;
  private songPage: Song[] = [];

  private trackPlaying: Track = null;


  constructor(private songList: SonglistService, private songPlayer: SongplayerService) {
    // this.parseSongList = this.parseSongList.bind(this);

    // this.setupDataSource = this.setupDataSource.bind(this);
    this.loadSongPage = this.loadSongPage.bind(this);
    this.isTrackPlaying = this.isTrackPlaying.bind(this);
    // this.isAnyPlaying = this.isAnyPlaying.bind(this);
    this.PlayClick = this.PlayClick.bind(this);
    this.StopClick = this.StopClick.bind(this);
  }

  ngOnInit() {
    // this.parseSongList(this.songs);
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.loadSongPage())
       )
      .subscribe();

    // this.dataSource.sortingDataAccessor
    // this.paginator.pageSize = 20;
    this.loadSongPage();

    this.dataSource.TotalCount.subscribe({
      error: console.error,
      next: x => this.SongCount = x
    });

    this.dataSource.SongPage.subscribe({
      error: console.error,
      next: x => this.songPage = x
    });
  }

  private loadSongPage() {
    // console.log("Loading song page: ", this.paginator.pageIndex, this.paginator.pageSize);
    this.dataSource.loadSongs(this.paginator.pageIndex, this.paginator.pageSize, this.playlist);
  }


  // private parseSongList(songs: string[]): void {
  //   if (songs) {
  //     let chain = Promise.resolve();

  //     songs.forEach((song: string) => {
  //       chain = chain.then(() => this.songList.get(song))
  //         .then((data) => {
  //           // console.log(data);
  //           this.dataSource.data.push(data);
  //           this.table.renderRows();
  //         })
  //     });

  //     chain
  //       .catch(console.error)
  //       ;
  //   }
  // }

  ngOnChanges(changes: SimpleChanges) {
    // console.log("Changes: ", changes);
    for (let propName in changes) {
      let change: SimpleChange = changes[propName];


      if (propName === 'songs' && change.currentValue) {
        // this.parseSongList(change.currentValue);
        // console.log("Songs: ", change.currentValue);
        this.dataSource.setSongs(change.currentValue);
        this.loadSongPage();
      }
    }
  }


  public PlayClick(track: Track) {
    this.songPlayer.PlayPreview(track);
    this.trackPlaying = track;
  }

  public StopClick() {
    this.songPlayer.StopPreview();
    this.trackPlaying = null;
  }

  public RefreshClick(midi: Song) {
    this.songList.RefreshSong(midi._id)
      .then((song: Song) => {
        console.log("Refreshed song: ", song);
        this.loadSongPage();
      })
      .catch(console.error)
      ;
  }

  public trackSelected($event) {
    console.log("Track selected:", $event);
    // $event.song.SelectedTrack = $event.index;
    console.log(this.songPage);
    let song = this.songPage.find((item: Song) => item._id = $event.song._id);
    console.log(song);
    if (song) {
      // Found
      song.SelectedTrack = $event.value;
    } else {
      console.error("Unable to find song: " + $event.song._id);
    }

    // console.log(song);
    // console.log(track);
    // this.trackPlaying = $event.track;

  }

  public isTrackPlaying(track: Track): boolean { return this.trackPlaying == track; }
  // public isAnyPlaying(): boolean {
  //   console.log("Playing: ", this.trackPlaying);
  //   return this.trackPlaying != null;
  // }
  public isPlayDisabled(song: Song): boolean {
    // console.log("isPlayDisabled: ", song);
    if (song.SelectedTrack == -1)
      return true;
    // if (this.trackPlaying != song.Tracks[song.SelectedTrack])
    //   return true;

    return false;
  }
}
