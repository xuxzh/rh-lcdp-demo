import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LcdpRenderComponent } from './lcdp-render.component';

describe('LcdpRenderComponent', () => {
  let component: LcdpRenderComponent;
  let fixture: ComponentFixture<LcdpRenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LcdpRenderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LcdpRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
