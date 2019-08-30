import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '../../services/database/database.service';

import {
  faHome,
  faList,
  faMusic,
  faPlusCircle,
  faGuitar
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  public Icons: any = {
    home: faHome,
    browse: faList,
    playlist: faMusic,
    add: faPlusCircle,
    freestyle: faGuitar
  }

  public Playlists: any = [];

  constructor(private router: Router, private dbService: DatabaseService) {
    // this.openPlaylist = this.openPlaylist.bind(this);
    this.navigateTo = this.navigateTo.bind(this);
    this.loadPlaylists = this.loadPlaylists.bind(this);
  }

  ngOnInit() {
    // for (let i=0;i<10;i++) {
    //   this.Playlists.push({
    //     _id: `playlist-${i}`,
    //     Name: `Test Playlist #${i}`,
    //     Created: Date.now(),
    //     Songs: []
    //   });
    // }
  }

  private loadPlaylists() {
    
  }

  // public openPlaylist(id: string): void {
  //   // console.log("Navigating: ", id);
  //   this.router.navigate(['/playlist/', id]);
  // }

  public navigateTo(...args) {
    this.router.navigate(args);
  }

}
