import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderTradeComponent } from './header-trade.component';

describe('HeaderTradeComponent', () => {
  let component: HeaderTradeComponent;
  let fixture: ComponentFixture<HeaderTradeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderTradeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
