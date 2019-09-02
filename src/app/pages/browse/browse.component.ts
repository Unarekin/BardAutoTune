import { Component, OnInit, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SonglistService } from '../../shared/services';
import { Song, Playlist } from '../../interfaces';

import {
  faSearch,
  faHdd
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {
  // public Songs: any[] = null;
  @Input() playlist: Playlist = null;

  public Icons: any = {
    Search: faSearch,
    HDD: faHdd
  };

  constructor(private songList: SonglistService) {
    // Bindings
    this.ScanClick = this.ScanClick.bind(this);
    this.SongDiscovered = this.SongDiscovered.bind(this);

    // Event listeners
    this.songList.on('song-discovered', this.SongDiscovered);
    this.songList.on('song-error', console.error);
  }

  ngOnInit() {
    // this.LoadSongList();
  }

  private SongDiscovered(song: Song) {
    console.log("Discovered: ", song);
    // this.snackBar.open(`Discovered: ${song.Name}`, 'Ok', {duration: 1000});
  }

  public AddClick() {
    
  }

  public ScanClick() {
    this.songList.ScanPath('./songs')
      .then(() => {
        console.log("Scanning complete.");
      })
  }

}
