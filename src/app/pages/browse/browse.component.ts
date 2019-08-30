import { Component, OnInit } from '@angular/core';
import { SonglistService } from '../../shared/services';

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
    this.songList.List()
      .then((songs: string[]) => {
        this.Songs = songs;
      })
      .catch(console.error)
      ;
  }

}
