import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export interface PasswordPolicyOptions {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
}

const DEFAULT_OPTIONS: PasswordPolicyOptions = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

@ValidatorConstraint({ name: 'passwordPolicy', async: false })
export class PasswordPolicyConstraint implements ValidatorConstraintInterface {
  private failedRules: string[] = [];

  validate(password: string): boolean {
    this.failedRules = [];

    if (typeof password !== 'string') {
      this.failedRules.push('La contraseña debe ser una cadena de texto');
      return false;
    }

    const options = DEFAULT_OPTIONS;

    // Check minimum length
    if (password.length < options.minLength!) {
      this.failedRules.push(
        `Debe tener al menos ${options.minLength} caracteres`,
      );
    }

    // Check maximum length
    if (password.length > options.maxLength!) {
      this.failedRules.push(`No debe exceder ${options.maxLength} caracteres`);
    }

    // Check uppercase requirement
    if (options.requireUppercase && !/[A-Z]/.test(password)) {
      this.failedRules.push('Debe contener al menos una letra mayúscula');
    }

    // Check lowercase requirement
    if (options.requireLowercase && !/[a-z]/.test(password)) {
      this.failedRules.push('Debe contener al menos una letra minúscula');
    }

    // Check numbers requirement
    if (options.requireNumbers && !/\d/.test(password)) {
      this.failedRules.push('Debe contener al menos un número');
    }

    // Check special characters requirement
    if (
      options.requireSpecialChars &&
      !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    ) {
      this.failedRules.push(
        'Debe contener al menos un carácter especial (!@#$%^&*()_+-=[]{};\':"|,.<>/?)',
      );
    }

    // Check for common weak patterns
    const commonPatterns = [
      /^12345/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /111111/,
      /123456/,
      /letmein/i,
      /welcome/i,
      /admin/i,
      /login/i,
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        this.failedRules.push('La contraseña es demasiado común o predecible');
        break;
      }
    }

    // Check for repeating characters (e.g., "aaa", "111")
    if (/(.)\1{2,}/.test(password)) {
      this.failedRules.push(
        'No debe contener más de 2 caracteres repetidos consecutivos',
      );
    }

    return this.failedRules.length === 0;
  }

  defaultMessage(): string {
    if (this.failedRules.length === 0) {
      return 'La contraseña no cumple con la política de seguridad';
    }
    return `Política de contraseña: ${this.failedRules.join('; ')}`;
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PasswordPolicyConstraint,
    });
  };
}
