import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule as PrimeDropdownModule } from 'primeng/dropdown';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PublicUserListComponent } from '@app/admin/pages/public-user/public-user-list/public-user-list.component';
import { AuthService } from '@app/auth/auth.service';
import { PingPaginatorComponent } from '@app/shared/components/ping-paginator/ping-paginator.component';
import { MockProvider } from 'ng-mocks';

describe('PublicUserListComponent', () => {
  let component: PublicUserListComponent;
  let fixture: ComponentFixture<PublicUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [PublicUserListComponent, PingPaginatorComponent],
    imports: [PrimeDropdownModule,
        TranslateModule.forRoot()],
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
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicUserListComponent);
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
          title: 'AGENDER',
          firstname: `Prénom ${i}`,
          lastname: `Nom ${i}`,
          email: `email-${1}@yopmail.com`,
          status: 'ENABLED'
        };
      }),
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    const listComponent: HTMLElement = fixture.nativeElement;
    expect(listComponent.querySelectorAll('table.administration-table > tbody tr').length).toEqual(5);
    expect(listComponent.querySelector('.infos-page').innerHTML.trim()).toEqual('1 - 5 of 10');
  });
});
