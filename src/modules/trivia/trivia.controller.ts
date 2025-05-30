import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/utils/api-response';
import { CreateTriviaDto } from './dtos/create-trivia.dto';
import { TriviaService } from './providers/trivia.service';
import { GetTriviaDto } from './dtos/get-trivia.dto';
import { UpdateTriviaDto } from './dtos/update-trivia.dto';

@Controller('apis/trivia')
export class TriviaController {
  constructor(private readonly service: TriviaService) {}

  @Post('create')
  async create(@Body() data: CreateTriviaDto): Promise<ApiResponse<any>> {
    const result = await this.service.createTrivia(data);
    return new ApiResponse('Trivia created successfully', result);
  }

  @Get()
  async findTriviaList(@Query() query: GetTriviaDto): Promise<ApiResponse<any>> {
    const result = await this.service.getTriviaList(query);
    return new ApiResponse(`${result.length} Trivia fetched from ${result[0].subject}.`, result);
  }

  @Put('update/:id')
  async update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Trivia Id must be a valid number') })) id: number,
    @Body() dto: UpdateTriviaDto): Promise<ApiResponse<any>> {
    const result = await this.service.updateTrivia(id, dto);
    return new ApiResponse('Successfully updated trivia', result);
  }


  @Delete(':id')
  async remove(
    @Param('id', 
    new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Trivia Id must be a valid number') })) 
    id: number): Promise<ApiResponse<any>> {
    const result = await this.service.remove(id);
    return new ApiResponse('Successfully deleted trivia', result);
  }

}
