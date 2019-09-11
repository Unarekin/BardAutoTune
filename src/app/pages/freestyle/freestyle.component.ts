import { Component, OnInit } from '@angular/core';
import { FreestyleService } from '../../shared/services';

@Component({
  selector: 'app-freestyle',
  templateUrl: './freestyle.component.html',
  styleUrls: ['./freestyle.component.scss']
})
export class FreestyleComponent implements OnInit {

  constructor(private freestyle: FreestyleService) { }

  ngOnInit() {
    this.freestyle.Start();
  }

}
