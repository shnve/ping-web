import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UrlLinksComponent } from './url-links.component';


describe('UrlLinksComponent', () => {
  let component: UrlLinksComponent;
  let fixture: ComponentFixture<UrlLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UrlLinksComponent ],
      imports: [ TranslateModule.forRoot() ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
