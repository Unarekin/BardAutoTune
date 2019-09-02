import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { EventEmitter } from 'events';
import { Song, Track } from '../../../interfaces';

@Component({
  selector: 'app-trackselector',
  templateUrl: './trackselector.component.html',
  styleUrls: ['./trackselector.component.scss']
})
export class TrackSelectorComponent implements OnInit {
  @Input() public song: Song = null;
  @Output() public trackSelected: EventEmitter<any> = new EventEmitter();
  // @Output() public selectedTrack: Track = null;

  constructor() {
  	this.trackChanged = this.trackChanged.bind(this);
  }

  ngOnInit() {
  	// console.log("Track listing: ", this.song);
  }

  public trackChanged($event) {
    // this.selectedTrack = this.song.Tracks[$event.value];
    this.trackSelected.emit({
      song: this.song,
      track: this.song.Tracks[$event.value],
      index: $event.value
    });
  }

}
