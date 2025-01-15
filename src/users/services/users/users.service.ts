import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/user.entity';
import { LoginDto } from 'src/users/dtos/Login.dto';
import { LoginResponseDto } from 'src/users/dtos/loginResponse.dto';
import { CreateUserParams, UpdateUserParams } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
    ) { }

    getUser() {
        return this.userRepository.find();
    }

    findUserById(id: number): Promise<User> {
        return this.userRepository.findOne({ where: { id } });
    }

    findUserByUsername(username: string): Promise<User> {
        return this.userRepository.findOne({ where: { username } });
    }

    findUserByEmail(email: string): Promise<User> {
        return this.userRepository.findOne({ where: { email } });
    }

    async createUser(userDetails: CreateUserParams) : Promise<CreateUserParams> {
        const newUser = this.userRepository.create({ ...userDetails, createdAt: new Date() });
        return this.userRepository.save(newUser);
    }

    async signIn(loginDto: LoginDto): Promise<LoginResponseDto> {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({ where: { email } });
        Logger.log("SkillTest ### SUCCESS1 =>"+JSON.stringify(user));
        if (user) {
            if (await user.validatePassword(password)) {
                Logger.log("SkillTest ### SUCCESS2 =>"+JSON.stringify(user));
                const userResponse = new LoginResponseDto();
                userResponse.id = user.id;
                userResponse.firstName = user.firstName;
                userResponse.lastName = user.lastName;
                userResponse.email = user.email;
                userResponse.username = user.username;
                //userResponse.refreshToken = user.refreshToken;
                userResponse.roles = user.roles;
                return userResponse;
              }else{
                //Throw exceptions that GlobalExceptionFilter will handle
                throw new UnauthorizedException(
                    `Wrong password for user using email as ${email}`,
                  );
              }
        } else {
        //   Logger.log("SkillTest ### SUCCESS2 :: NO USER =>");
        //   return null;
        throw new UnauthorizedException(
            `${email} is not registered`,
          );
        }
    }

    updateUser(id: number, updateUserDetails: UpdateUserParams) {
        return this.userRepository.update({ id }, { ...updateUserDetails })
    }

    // /: Promise<UserDocument>
    update(id: number, updateUserDetails: UpdateUserParams) {
        Logger.log("Yes updated "+id+" for "+JSON.stringify(updateUserDetails));
        return this.userRepository.update({ id }, { ...updateUserDetails })
    }

    deleteUser(id: number) {
        return this.userRepository.delete(id)
    }
}
