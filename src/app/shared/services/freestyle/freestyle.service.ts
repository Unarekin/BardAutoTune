import { Injectable, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root'
})
export class FreestyleService implements OnInit {
  private MODEL_URL: string = "/assets/rnn/basic_rnn";


  constructor() {
    this.Start = this.Start.bind(this);
  }
  ngOnInit() {}


  public Start() {}
}
