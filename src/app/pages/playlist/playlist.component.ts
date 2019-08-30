import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
  


  public Playlist: any = {
    _id: '12345',
    Name: 'Test Playlist',
    Created: Date.now(),
    Duration: 206000,
    Songs: [
      {
        Name: "Test Song",
        SelectedTrack: 0,
        Tracks: [
          {
            Name: "Piano",
            Duration: 206000
          }
        ]
      }
    ]
  }

  constructor() { }

  ngOnInit() {
  }

}
