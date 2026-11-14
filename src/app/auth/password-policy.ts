import { ValidatorFn, Validators } from '@angular/forms';

/**
 * PISAC: misma política de contraseñas que Keycloak (ver ping-api/db/keycloak-seguridad-sesion.sh):
 * mínimo 12 caracteres, al menos una mayúscula, una minúscula, un número y un símbolo.
 * Keycloak además rechaza contraseñas iguales al usuario o al correo y las 5 últimas usadas.
 */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export const passwordPolicyValidators: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(PASSWORD_MIN_LENGTH),
  Validators.pattern(PASSWORD_PATTERN)
];
