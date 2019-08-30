import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-trackselector',
  templateUrl: './trackselector.component.html',
  styleUrls: ['./trackselector.component.scss']
})
export class TrackSelectorComponent implements OnInit {
  @Input() public song: any = null;

  constructor() { }

  ngOnInit() {
  }

}
