import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SerieType } from '@app/models/serie.model';
import { TranslateModule } from '@ngx-translate/core';
import { SelectSerieItemComponent } from './select-serie-item.component';


describe('SelectSerieItemComponent', () => {
  let component: SelectSerieItemComponent;
  let fixture: ComponentFixture<SelectSerieItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectSerieItemComponent ],
      imports: [
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectSerieItemComponent);
    component = fixture.componentInstance;
    component.serie = {
      id : 'id',
      name: 'serie',
      type: SerieType.COASTAL_NAVIGATIONAL_WARNING,
      maritimeService: '',
      ranges: []
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
