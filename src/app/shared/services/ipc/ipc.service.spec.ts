import { TestBed } from '@angular/core/testing';

import { IPCService } from './ipc.service';

describe('IPCService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IPCService = TestBed.get(IPCService);
    expect(service).toBeTruthy();
  });
});
