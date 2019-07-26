import { TestBed } from '@angular/core/testing';

import { OccupantService } from './occupant.service';

describe('OccupantService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OccupantService = TestBed.get(OccupantService);
    expect(service).toBeTruthy();
  });
});
