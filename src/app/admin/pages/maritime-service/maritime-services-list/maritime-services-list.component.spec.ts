import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '@app/auth/auth.service';
import { PingPaginatorComponent } from '@app/shared/components/ping-paginator/ping-paginator.component';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { DropdownModule as PrimeDropdownModule } from 'primeng/dropdown';
import { MaritimeServicesListComponent } from './maritime-services-list.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MaritimeServicesListComponent', () => {
  let component: MaritimeServicesListComponent;
  let fixture: ComponentFixture<MaritimeServicesListComponent>;
  let mockAuthService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [MaritimeServicesListComponent, PingPaginatorComponent],
    imports: [PrimeDropdownModule, TranslateModule.forRoot()],
    providers: [
        MockProvider(AuthService, {
            hasRoleFunctionalAdmin(): boolean {
                return false;
            },
            isProUser(): boolean {
                return false;
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();
  });

  beforeEach(() => {
    mockAuthService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(MaritimeServicesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.pageItem = {
      totalElements: 10,
      totalPages: 2,
      first: true,
      last: false,
      size: 5,
      number: 0,
      pageable: {
        pageSize: 5,
        pageNumber: 0
      },
      content: Array.apply(null, {length: 5}).map(i => {
        return {
          id: `${i}`,
          name: `Nom ${i}`,
          type: 'CND',
          areas: [{
            name: 'Area 1'
          }, {
            name: 'Area 2'
          }
          ]
        };
      }),
    };
    fixture.detectChanges();
  });

  it('should show all informations about the page / content', () => {
    const areaListComponent: HTMLElement = fixture.nativeElement;
    expect(areaListComponent.querySelectorAll('table.administration-table > tbody tr').length).toEqual(5);
    expect(areaListComponent.querySelector('.infos-page').innerHTML.trim()).toEqual('1 - 5 of 10');
  });

  it('should show add button when functional admin', () => {
    const comp: HTMLElement = fixture.nativeElement;
    spyOn(mockAuthService, 'hasRoleFunctionalAdmin').and.returnValue(true);
    fixture.detectChanges();
    expect(comp.querySelectorAll('.add-button').length).toEqual(1);
  });

  it('should hide add button when service user', () => {
    const comp: HTMLElement = fixture.nativeElement;
    spyOn(mockAuthService, 'hasRoleFunctionalAdmin').and.returnValue(false);
    fixture.detectChanges();
    expect(comp.querySelectorAll('.add-button').length).toEqual(0);
  });

  it('should show edit button when functional admin', () => {
    const comp: HTMLElement = fixture.nativeElement;
    spyOn(mockAuthService, 'hasRoleFunctionalAdmin').and.returnValue(true);
    fixture.detectChanges();
    expect(comp.querySelectorAll('.edit-button').length).toEqual(5);
  });


  it('should hide edit button when functional admin', () => {
    const comp: HTMLElement = fixture.nativeElement;
    spyOn(mockAuthService, 'hasRoleFunctionalAdmin').and.returnValue(false);
    fixture.detectChanges();
    expect(comp.querySelectorAll('.edit-button').length).toEqual(0);
  });

  it('should show preview button when pro user with service role', () => {
    const comp: HTMLElement = fixture.nativeElement;
    spyOn(mockAuthService, 'hasRoleFunctionalAdmin').and.returnValue(false);
    spyOn(mockAuthService, 'hasSomeRoleOnService').and.returnValue(true);
    fixture.detectChanges();
    expect(comp.querySelectorAll('.preview-button').length).toEqual(5);
  });

  it('should hide preview button when pro user without service role', () => {
    const comp: HTMLElement = fixture.nativeElement;
    spyOn(mockAuthService, 'hasRoleFunctionalAdmin').and.returnValue(false);
    spyOn(mockAuthService, 'hasSomeRoleOnService').and.returnValue(false);
    fixture.detectChanges();
    expect(comp.querySelectorAll('.preview-button').length).toEqual(0);
  });

  it('should show preview button when functional admin', () => {
    const comp: HTMLElement = fixture.nativeElement;
    spyOn(mockAuthService, 'hasRoleFunctionalAdmin').and.returnValue(true);
    fixture.detectChanges();
    expect(comp.querySelectorAll('.preview-button').length).toEqual(5);
  });
});
