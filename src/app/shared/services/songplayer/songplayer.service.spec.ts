import { TestBed } from '@angular/core/testing';

import { SongplayerService } from './songplayer.service';

describe('SongplayerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SongplayerService = TestBed.get(SongplayerService);
    expect(service).toBeTruthy();
  });
});
