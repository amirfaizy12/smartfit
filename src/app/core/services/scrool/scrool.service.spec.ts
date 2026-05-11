import { TestBed } from '@angular/core/testing';

import { ScroolService } from './scrool.service';

describe('ScroolService', () => {
  let service: ScroolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScroolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
