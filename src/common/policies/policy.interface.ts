import { User } from "../typeorm/entities/user.entity";

export interface PolicyHandler {
    handle(user: User, resourceType: string, resourceId: number): boolean;
}
