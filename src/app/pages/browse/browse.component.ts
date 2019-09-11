import { Component, OnInit, Input, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SonglistService, SongplayerService } from '../../shared/services';
import { Song, Playlist, Track } from '../../interfaces';
import { timer } from 'rxjs';

import {
  faSearch,
  faHdd,
  faStop
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {
  // public Songs: any[] = null;
  @Input() playlist: Playlist = null;

  public previewPlaying: boolean = false;
  public previewTrack: Track = null;
  public previewSong: Song = null;
  public PreviewProgress: number = 0;
  public PreviewTime: string = "00:00";
  public PreviewDuration: string = "00:00";
  public ScrollTime: number = 0;


  public Icons: any = {
    Search: faSearch,
    HDD: faHdd,
    Stop: faStop
  };

  // private previewTime: number = 0;
  private previewTimer: any = null;
  private previewStart: number = 0;
  // private previewTimeInterval: any = null;


  constructor(private songList: SonglistService, private songPlayer: SongplayerService, private zone: NgZone) {
    // Bindings
    this.ScanClick = this.ScanClick.bind(this);
    this.SongDiscovered = this.SongDiscovered.bind(this);
    this.PreviewStart = this.PreviewStart.bind(this);
    this.PreviewEnd = this.PreviewEnd.bind(this);
    this.formatTimeString = this.formatTimeString.bind(this);
    this.updatePreviewTimes = this.updatePreviewTimes.bind(this);

    // Event listeners
    this.songList.on('song-discovered', this.SongDiscovered);
    this.songList.on('song-error', console.error);



    this.songPlayer.on('preview-start', this.PreviewStart);
    this.songPlayer.on('preview-stopped', this.PreviewEnd);
    this.songPlayer.on('preview-end', this.PreviewEnd);

  }

  ngOnInit() {
    // this.LoadSongList();
  }

  private PreviewStart(settings: any) {
    // console.log("Previewing: ", settings);
    this.previewPlaying = true;
    this.previewTrack = settings.track;
    this.previewSong = settings.song;


    // this.previewTime = 0;
    if (NgZone.isInAngularZone()) {
      this.PreviewTime = this.formatTimeString(0);
      this.PreviewDuration = this.formatTimeString(settings.song.Duration * 1000);
    } else {
      this.zone.run(() => {
        this.PreviewTime = this.formatTimeString(0);
        this.PreviewDuration = this.formatTimeString(settings.song.Duration * 1000);
      });
    }

    this.PreviewProgress = 0;
    this.previewStart = Date.now();
    this.previewTimer = timer(0, 15);
    this.previewTimer.subscribe(val => {
      this.updatePreviewTimes();
    });
  }

  private updatePreviewTimes(): void {
    let duration = Date.now() - this.previewStart;

    // this.PreviewDuration = duration / this.
    let perc = duration / (this.previewSong.Duration * 1000);
    this.PreviewProgress = perc * 100;
    this.PreviewTime = this.formatTimeString(duration);
    this.ScrollTime = duration;
  }

  private formatTimeString(time: number): string {
    let seconds = Math.floor(time / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds -= (minutes * 60);
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  private PreviewEnd() {
    this.previewPlaying = false;
    this.previewTrack = null;
  }

  private SongDiscovered(song: Song) {
    console.log("Discovered: ", song);
    // this.snackBar.open(`Discovered: ${song.Name}`, 'Ok', {duration: 1000});
  }

  public StopClick() {
    this.songPlayer.StopPreview();
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
