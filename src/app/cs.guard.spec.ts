import { TestBed } from '@angular/core/testing';

import { CsGuard } from './cs.guard';

describe('CsGuard', () => {
  let guard: CsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
