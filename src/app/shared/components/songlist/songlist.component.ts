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
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { tap } from 'rxjs/operators';

import * as path from 'path';

import { SonglistService } from '../../services/';
import { SongDataSource } from './songlist.datasource';

@Component({
  selector: 'app-songlist',
  templateUrl: './songlist.component.html',
  styleUrls: ['./songlist.component.scss']
})
export class SonglistComponent implements OnInit, OnChanges, AfterViewInit {
  // @Input() public songs: any[] = [];
  @Input() public songs: string[] = [];
  @ViewChild('table', { static: true}) private table: any = null;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  public dataSource: SongDataSource = new SongDataSource(this.songList);
  public displayedColumns: string[] = ["Name", "Track", "Duration"];



  constructor(private songList: SonglistService) {
    // this.parseSongList = this.parseSongList.bind(this);

    // this.setupDataSource = this.setupDataSource.bind(this);
    this.loadSongPage = this.loadSongPage.bind(this);
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
  }

  private loadSongPage() {
    // console.log("Loading song page: ", this.paginator.pageIndex, this.paginator.pageSize);
    this.dataSource.loadSongs(this.paginator.pageIndex, this.paginator.pageSize);
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
}
