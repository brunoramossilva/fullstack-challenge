import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  // class-validator decorators are runtime metadata factories.
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
