import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PianorollComponent } from './pianoroll.component';

describe('PianorollComponent', () => {
  let component: PianorollComponent;
  let fixture: ComponentFixture<PianorollComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PianorollComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PianorollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
