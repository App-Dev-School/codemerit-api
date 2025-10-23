import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    MaxLength,
    IsIn
} from 'class-validator';

export class CreateNotificationDto {
    @ApiProperty({
        example: 1,
        description: 'The ID of the user who receives the notification',
    })
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @ApiPropertyOptional({
        example: 2,
        description: 'The ID of the sender (0 if system-generated)',
    })
    @IsNumber()
    @IsOptional()
    senderId?: number;

    @ApiProperty({
        example: 'New Message Received',
        description: 'Short title of the notification',
        maxLength: 255,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @ApiProperty({
        example: 'You have received a new message from John Doe.',
        description: 'The detailed message body of the notification',
    })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiPropertyOptional({
        example: 0,
        description: 'Flag to indicate if the notification is seen (0 = unseen, 1 = seen)',
        enum: [0, 1],
    })
    @IsNumber()
    @IsOptional()
    @IsIn([0, 1])
    isSeen?: number;

    @ApiPropertyOptional({
        example: '12345',
        description: 'Optional data reference ID related to the notification',
    })
    @IsString()
    @IsOptional()
    dataId?: string;

    @ApiPropertyOptional({
        example: 'Message from John',
        description: 'Optional data title related to the notification',
    })
    @IsString()
    @IsOptional()
    dataTitle?: string;
}
