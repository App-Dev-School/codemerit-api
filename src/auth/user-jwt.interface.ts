import { LoginResponseDto } from "src/users/dtos/loginResponse.dto";
import { SignUpResponse } from "src/users/dtos/SignUpResponse.dto";

export interface UserJwtResponse {
  message: string;
  data: {
    user: LoginResponseDto | SignUpResponse;
    accessToken: string;
  }
}