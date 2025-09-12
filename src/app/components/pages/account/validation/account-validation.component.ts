import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticatedUser } from 'src/app/models/public-user.model';
import { UsersApi } from '../../../../api/users.api';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-account-validation',
  templateUrl: './account-validation.component.html',
  styleUrls: ['./account-validation.component.scss']
})
export class AccountValidationComponent implements OnInit {

  submitting = true;
  errors: string;
  displayConfirmModal = false;

  constructor(private readonly authService: AuthService,
              private readonly userService: UsersApi,
              private readonly router: Router) { }

  ngOnInit(): void {
    const token = this.authService.getToken();
    this.userService.enableUser(token)
      .subscribe(
        (authenticatedPublicUser: AuthenticatedUser) => {
          this.authService.login(authenticatedPublicUser, token);
          // Show validation confirmation to the user
          this.showModalDialog();
        },
        error => {
          this.submitting = false;
          const errorsPayload = Object.keys(error);
          if (errorsPayload.length) {
            const responsePayload = error[errorsPayload[0]];
            this.errors = `account.validation.errors.${responsePayload}`;
          } else {
            this.errors = error.toString();
          }
        }
      );
  }

  /**
   * Show the modal dialog of account validation confirmation
   */
   showModalDialog(): void {
    this.displayConfirmModal = true;
  }

  /**
   * Hide the modal dialog of account validation confirmation,
   * then call method to redirect to another page
   */
  hideModalDialog(): void {
    this.displayConfirmModal = false;
    this.redirectToNextPageAfterValidation();
  }

  /**
   * Redirect to next page after validation
   * @private
   */
  private redirectToNextPageAfterValidation(): void {
    this.router.navigate(['/']);
  }
}
