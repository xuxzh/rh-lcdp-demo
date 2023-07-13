import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderLockComponent } from './header-lock.component';

describe('HeaderLockComponent', () => {
  let component: HeaderLockComponent;
  let fixture: ComponentFixture<HeaderLockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderLockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderLockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
