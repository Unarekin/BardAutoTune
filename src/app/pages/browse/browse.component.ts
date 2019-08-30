import { Component, OnInit } from '@angular/core';
import { SonglistService } from '../../shared/services';
import { Song } from '../../interfaces';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {
  public Songs: any[] = null;

  constructor(private songList: SonglistService) {
    this.LoadSongList = this.LoadSongList.bind(this);
  }

  ngOnInit() {
    this.LoadSongList();
  }

  public LoadSongList() {
    this.songList.ListSongs()
      .then((songs: Song[]) => {
        this.Songs = songs;
      })
      .catch(console.error)
      ;
  }

}
