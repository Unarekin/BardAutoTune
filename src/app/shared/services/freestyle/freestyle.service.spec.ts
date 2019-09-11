import { TestBed } from '@angular/core/testing';

import { FreestyleService } from './freestyle.service';

describe('FreestyleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FreestyleService = TestBed.get(FreestyleService);
    expect(service).toBeTruthy();
  });
});
