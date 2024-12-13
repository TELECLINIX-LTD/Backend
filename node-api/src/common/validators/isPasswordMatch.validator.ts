import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsPasswordMatch implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [passwordField] = args.constraints;
    const object = args.object as any;
    return value === object[passwordField];  // Compare confirmPassword with password field
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Password and Confirm Password do not match';
  }
}
