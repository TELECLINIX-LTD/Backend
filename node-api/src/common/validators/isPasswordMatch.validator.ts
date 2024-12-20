import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsPasswordMatch implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [passwordField] = args.constraints;
    const object = args.object as any;
    return value === object[passwordField];
  }

  defaultMessage(args: ValidationArguments): string {
    const field = args.property; // Example usage
    return `${field} and password do not match`;
  }
}
