import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../material.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';


import { DurationFormatPipe } from './pipes/duration/duration.pipe';


import {
  MenuComponent,
  TrackSelectorComponent,
  SongComponent,
  SonglistComponent
} from './components';


@NgModule({
  declarations: [
    PageNotFoundComponent,
    WebviewDirective,
    MenuComponent,
    DurationFormatPipe,
    TrackSelectorComponent,
    SongComponent,
    SonglistComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MaterialModule,
    FontAwesomeModule,
    FormsModule
  ],
  exports: [
    TranslateModule,
    WebviewDirective,
    MenuComponent,
    TrackSelectorComponent,
    SongComponent,
    SonglistComponent,
    DurationFormatPipe
  ]
})
export class SharedModule {}
