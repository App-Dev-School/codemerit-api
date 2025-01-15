export type CreateUserParams = {
    id?:number;
    firstName: string;
    lastName: string;
    email: string;
    username?:string;
    password?: string;
    roles: string;
  };
  
  export type UpdateUserParams = {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    refreshToken?:string;
  };
  
  export type CreateUserProfileParams = {
    firstName: string;
    lastName: string;
    age: number;
    dob: string;
  };

  export type CreateUserPostParams = {
    title: string;
    description: string;
  };