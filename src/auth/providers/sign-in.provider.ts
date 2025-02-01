import {
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
  forwardRef
} from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { SignInDto } from '../dtos/signin.dto';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { HashingProvider } from './hashing.provider';

@Injectable()
export class SignInProvider {
  constructor(
    // Injecting UserService
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    /**
     * Inject the hashingProvider
     */
    private readonly hashingProvider: HashingProvider,

    /**
     * Inject generateTokensProvider
     */
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  public async signIn(signInDto: SignInDto) {
    // find user by email ID
    let user = await this.usersService.findOneByEmail(signInDto.email);
    let isEqual: boolean = false;

    try {
      // Compare the password to hash
      isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare the password',
      });
    }

    if (!isEqual) {
      throw new UnauthorizedException('Password does not match');
    }
    let tokens : any;
    try {
      // Generate access token
    tokens = await this.generateTokensProvider.generateTokens(user);
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Error saving tokens',
      });
    }
    
    try {
      await this.usersService.update(user.id, {
        accessToken: tokens.refreshToken,
        refreshToken: tokens.refreshToken
      });  
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Error saving tokens',
      });
    }
    return tokens;
  }
}
