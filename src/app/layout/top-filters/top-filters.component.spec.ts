import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopFiltersComponent } from './top-filters.component';

describe('TopFiltersComponent', () => {
  let component: TopFiltersComponent;
  let fixture: ComponentFixture<TopFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopFiltersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TopFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
