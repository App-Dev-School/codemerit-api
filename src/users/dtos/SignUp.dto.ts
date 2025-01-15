import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, MaxLength } from "class-validator";
import { Role } from "src/auth/utilities/role.enum";

export class SignUpDto {
    @IsNotEmpty()
    @IsString()
    @Length(2, 20, { message: 'First name should be between 2 to 20 characters' })
    firstName: string;

    @IsString()
    @Length(2, 20, { message: 'First name should be between 2 to 20 characters' })
    lastName: string;

    @IsNotEmpty()
    @IsEmail()
    @MaxLength(20, { message: 'E-mail is too long.' })
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length(2, 20, { message: 'First name should be between 2 to 20 characters' })
    username: string;

    @IsNotEmpty()
    @IsString()
    @Length(2, 20, { message: 'Password ' })
    password: string;

    @IsNotEmpty()
    @IsEnum(Role)
    roles: string = Role.User;
 }