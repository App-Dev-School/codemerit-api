import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse } from 'src/common/utils/api-response';
import { CreateInterviewDto } from './dtos/create-interview.dto';
import { InterviewService } from './providers/interview.service';
import { Public } from 'src/core/auth/decorators/public.decorator';
import {
  Put,
  Get,
  Param,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { UpdateInterviewDto } from './dtos/update-interview.dto';
import { SubmitInterviewDto } from './dtos/submit-interview.dto';

@Controller('apis/interviews')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}
  @Public()
  @Post()
  async createInterview(
    @Body() dto: CreateInterviewDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.interviewService.createInterview(dto);

    return new ApiResponse('Interview created successfully', result);
  }

  @Public()
  @Put(':id')
  async updateInterview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInterviewDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.interviewService.updateInterview(id, dto);

    return new ApiResponse('Interview updated successfully', result);
  }

  @Public()
  @Post('submit')
  async submitInterview(
    @Body() dto: SubmitInterviewDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.interviewService.submitInterview(dto);
    return new ApiResponse('Interview submitted successfully', result);
  }

  @Public()
  @Get(':interviewCode')
  async getInterviewDetails(
    @Param('interviewCode') interviewCode: string,
  ): Promise<ApiResponse<any>> {
    const result =
      await this.interviewService.getInterviewDetails(interviewCode);

    return new ApiResponse('Interview details fetched successfully', result);
  }

  @Public()
  @Get()
  async getInterviews(
    @Query('userId', new DefaultValuePipe(0), ParseIntPipe)
    userId: number,

    @Query('fetchAll', new DefaultValuePipe(false), ParseBoolPipe)
    fetchAll: boolean,
  ): Promise<ApiResponse<any>> {
    const result = await this.interviewService.getInterviews(userId, fetchAll);

    return new ApiResponse('Interviews fetched successfully', result);
  }
}
