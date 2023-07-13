import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainWebComponent } from './main-web.component';

describe('MainWebComponent', () => {
  let component: MainWebComponent;
  let fixture: ComponentFixture<MainWebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainWebComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
