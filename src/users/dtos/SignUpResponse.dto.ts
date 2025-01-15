import { CreateUserParams } from "src/utils/types";

// export class SignUpResponse {
//   data: CreateUserParams;
//   message: string;
//   //data: UserJwtResponse;
// }

export interface SignUpResponse {
  message: string;
  data: {
    user: CreateUserParams;
    accessToken: string;
    extras: string;
  }
}

