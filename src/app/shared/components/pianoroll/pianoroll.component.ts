import {
  Component,
  OnInit,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  SimpleChange,
  ViewChild,
  NgZone,
  ElementRef,
  HostListener
} from '@angular/core';
import * as PIXI from 'pixi.js';
import { Scrollbox } from 'pixi-scrollbox';
// import { PixiService } from 'ngxpixi';
import {
  Song,
  Track,
  Note,
  TimeSignature,
  Tempo
} from '../../../interfaces';

@Component({
  selector: 'app-pianoroll',
  templateUrl: './pianoroll.component.html',
  styleUrls: ['./pianoroll.component.scss']
})
export class PianorollComponent implements OnInit, OnChanges, OnDestroy {
  // Public members
  @Input() public song: Song = null;
  @Input() public scrollTime: number = 0;
  @ViewChild('rollCanvas', {static: true}) public canvasRef: ElementRef = null;


  public mainStage: Scrollbox = null;
  public gridLayer: PIXI.Container = null;
  public noteLayer: PIXI.Container = null;
  public overlayLayer: PIXI.Container = null;
  public app: PIXI.Application = null;

  // Private members
  private isDestroyed: boolean = false;
  private barHeight = 15;
  private secondWidth = 60;

  private stageHeight: number = 600;
  private stageWidth: number = 800;

  private onTrackNoteColor: number = 0xa9a9a9;
  private offTrackNoteColor: number = 0x1f1f1f;;
  private playingNoteColor: number = 0xc1c1c1;

  private noteListWithSharps: string[] = ["C6", "B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5", "D5", "C#5", "C5", "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4", "E4", "D#4", "D4", "C#4", "C4", "B3", "A#3", "A3", "G#3", "G3", "F#3", "F3", "E3", "D#3", "D3", "C#3", "C3"];
  private noteListWithFlats: string[] = ["C6", "B5", "A5", "A♭5", "G5", "G♭5", "F5", "F♭5", "E5", "D5", "D♭5", "C5", "C♭5", "B4", "A4", "A♭4", "G4", "G♭4", "F4", "F♭4", "E4", "D4", "D♭4", "C4", "C♭4", "B3", "A3", "A♭3", "G3", "G♭3", "F3", "F♭3", "E3", "D3", "D♭3", "C3", "C♭3"];

  constructor(/*private pixi: PixiService,*/ private zone: NgZone) {
    // Bindings
    this.initPixi = this.initPixi.bind(this);
    this.initLayers = this.initLayers.bind(this);
    this.initGrid = this.initGrid.bind(this);
    this.initNotes = this.initNotes.bind(this);
    this.initTrack = this.initTrack.bind(this);
    this.initOverlay = this.initOverlay.bind(this);
    this.animate = this.animate.bind(this);
    this.setSong = this.setSong.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void{
    for (let prop in changes) {
      let change = changes[prop];
      if (prop == 'song')
        this.setSong(change.currentValue);
    }
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.app.ticker.remove(this.animate);
  }

  @HostListener('window:resize', ['$event'])
  private onWindowResize($event) {
    this.app.stage.width = this.canvasRef.nativeElement.clientWidth;
    this.mainStage.boxWidth = this.canvasRef.nativeElement.clientWidth;
    // console.log($event);
    // console.log(this.canvasRef.nativeElement.clientWidth + "x" + this.canvasRef.nativeElement.clientHeight);
  }



  private initPixi(): void {
    
    this.app = new PIXI.Application({
      width: this.canvasRef.nativeElement.clientWidth,
      height: 300,
      backgroundColor: 0,
      resolution: window.devicePixelRatio || 1,
      transparent: false
    });
    this.canvasRef.nativeElement.appendChild(this.app.view);

//     this.zone.runOutsideAngular(() => {
//       requestAnimationFrame(this.drawCanvas);
//     });
  }

  private initLayers(): void {
    // this.mainStage = new PIXI.Container();
    this.mainStage = new Scrollbox({boxWidth: this.canvasRef.nativeElement.clientWidth, boxHeight: 300});
    // this.mainStage.position.set(50,75);
    this.mainStage.overflowX = 'hidden';

    this.gridLayer = new PIXI.Container();
    this.noteLayer = new PIXI.Container();
    this.overlayLayer = new PIXI.Container();

    this.mainStage.content.addChild(this.gridLayer);
    this.mainStage.content.addChild(this.noteLayer);
    this.mainStage.content.addChild(this.overlayLayer);


    this.app.stage.addChild(this.mainStage);
    this.app.ticker.add(this.animate);

    this.mainStage.update();
  }

  private initGrid(): void {
    let texture = PIXI.Texture.from('/assets/images/pianoGrid.png');
    let gridSprite = new PIXI.TilingSprite(texture, (this.song.Duration * this.secondWidth) + this.stageWidth, this.barHeight * 40);

    gridSprite.anchor.set(0,0);
    gridSprite.x = 0;
    gridSprite.y = 0;
    this.gridLayer.addChild(gridSprite);
  }

  private initNotes(): void {
    this.song.Tracks.forEach(this.initTrack);
  }

  private initTrack(track: Track, index: number): void {
    let isSelected = this.song.SelectedTrack == index;

    track.Notes.forEach((note: Note) => {
      let box = this.noteLayer.addChild(new PIXI.Graphics());

      let noteIndex = this.noteListWithSharps.indexOf(note.Name) == -1 ? this.noteListWithFlats.indexOf(note.Name) : this.noteListWithSharps.indexOf(note.Name);
      if (noteIndex == -1) {
        console.log("Unknown note: ", note.Name);
        return;
      }


      let x: number = (note.Time * 60) + 46;
      let y: number = (noteIndex * 16);
      let w: number = note.Duration * 60;
      let h: number = 16;

      box.beginFill(isSelected ? this.onTrackNoteColor : this.offTrackNoteColor)
        .drawRect(x, y, w, h)
      box.endFill();
    });
  }

  private initOverlay(): void {

    let box = this.overlayLayer.addChild(new PIXI.Graphics());
    box.beginFill(0xffffff, 1).drawRect(0,0,23,600);
    box.endFill();

    let labelTexture = PIXI.Texture.from('/assets/images/barLabels.png');
    let labelSprite = new PIXI.TilingSprite(labelTexture, 23, 589)
    labelSprite.anchor.set(0,0);
    labelSprite.x=0;
    labelSprite.y=0;
    this.overlayLayer.addChild(labelSprite);
  }

  private animate(delta: number): void {
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        // Animation

        // this.mainStage.x -= this.scrollTime/1000;
        // this.mainStage.x -= delta;

        let scrollAmount = (this.scrollTime/1000) * 60;
        this.gridLayer.x = -scrollAmount;
        this.noteLayer.x = -scrollAmount;


        // Re-run next update.
        // setTimeout(this.animate, 0);

      });
    });
  }

  private setSong(song: Song): void {
    if (song) {
      this.initPixi();
      this.initLayers();
      this.initGrid();
      this.initNotes();
      this.initOverlay();
      // this.animate();
    }
  }

  public onMouseWheel($event: any): void {
    // // console.log("Mouse wheel: ", $event);
    // let delta = $event.deltaY;
    // let scaleChange = (-1 * delta) / 1000;
    // // this.mainStage.scale += scaleChange;
    // this.mainStage.scale.x += scaleChange;
    // this.mainStage.scale.y += scaleChange;

    // console.log("Scaling by " + scaleChange + ": ", this.mainStage.scale);
  }

}

