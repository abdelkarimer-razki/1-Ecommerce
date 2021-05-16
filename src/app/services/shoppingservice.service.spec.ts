import { TestBed } from '@angular/core/testing';

import { ShoppingserviceService } from './shoppingservice.service';

describe('ShoppingserviceService', () => {
  let service: ShoppingserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShoppingserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
