import { TestBed } from '@angular/core/testing';

import { BuyproductService } from './buyproduct.service';

describe('BuyproductService', () => {
  let service: BuyproductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuyproductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
