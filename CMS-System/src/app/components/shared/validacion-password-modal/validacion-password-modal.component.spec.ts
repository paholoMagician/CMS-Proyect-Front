import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidacionPasswordModalComponent } from './validacion-password-modal.component';

describe('ValidacionPasswordModalComponent', () => {
  let component: ValidacionPasswordModalComponent;
  let fixture: ComponentFixture<ValidacionPasswordModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidacionPasswordModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidacionPasswordModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
