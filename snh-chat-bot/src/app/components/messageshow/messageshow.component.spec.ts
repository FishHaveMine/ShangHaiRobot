import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageshowComponent } from './messageshow.component';

describe('MainComponent', () => {
  let component: MessageshowComponent;
  let fixture: ComponentFixture<MessageshowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageshowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
