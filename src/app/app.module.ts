import 'reflect-metadata';
import '../polyfills';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Angular material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';

import { FlexLayoutModule } from '@angular/flex-layout';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
  HomeComponent,
  PlaylistComponent,
  BrowseComponent,
  FreestyleComponent
} from './pages';

import {
  DatabaseService,
  SongplayerService,
  SonglistService,
  FreestyleService
} from './shared/services';

import { AppComponent } from './app.component';
// import { MenuComponent } from './shared/components';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PlaylistComponent,
    BrowseComponent,
    FreestyleComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    AppRoutingModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    FlexLayoutModule,
    FontAwesomeModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    DatabaseService,
    SonglistService,
    SongplayerService,
    FreestyleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
