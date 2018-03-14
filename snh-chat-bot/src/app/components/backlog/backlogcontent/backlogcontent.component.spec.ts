import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacklogcontentComponent } from './backlogcontent.component';

describe('BacklogComponent', () => {
  let component: BacklogcontentComponent;
  let fixture: ComponentFixture<BacklogcontentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacklogcontentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacklogcontentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
