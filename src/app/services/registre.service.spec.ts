import { TestBed } from '@angular/core/testing';

import { RegistreService } from './registre.service';

describe('RegistreService', () => {
  let service: RegistreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
