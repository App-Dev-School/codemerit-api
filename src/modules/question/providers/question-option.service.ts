import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionOption } from 'src/common/typeorm/entities/question-option.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateOptionDto } from '../dtos/create-option.dto';
import { UpdateOptionDto } from '../dtos/update.option.dto';

@Injectable()
export class QuestionOptionService {
  constructor(
    @InjectRepository(QuestionOption)
    private readonly questionOptionRepository: Repository<QuestionOption>,
  ) {}

  async create(dto: CreateOptionDto): Promise<QuestionOption> {
    const option = this.questionOptionRepository.create(dto);
    return this.questionOptionRepository.save(option);
  }

  // async createWithQuestionId(dto: CreateOptionDto): Promise<Option> {
  //   const option = this.optionRepository.create(dto);
  //   return this.optionRepository.save(option);
  // }

  async createWithQuestionId(
    manager: EntityManager,
    option: QuestionOption[],
  ): Promise<QuestionOption[]> {
    // const option = manager.create(Option);
    const savedOption = await manager.save(option);
    return savedOption;
  }

  async findAll(): Promise<QuestionOption[]> {
    return this.questionOptionRepository.find();
  }

  async findByQuestionId(
    questionId: number,
  ): Promise<QuestionOption[] | undefined> {
    const options = await this.questionOptionRepository.find({
      where: { questionId },
    });
    return options;
  }

  async findOne(id: number): Promise<QuestionOption> {
    const option = await this.questionOptionRepository.findOne({
      where: { id },
    });
    if (!option) throw new NotFoundException('Option not found');
    return option;
  }

  async update(id: number, dto: UpdateOptionDto): Promise<QuestionOption> {
    const option = await this.findOne(id);
    Object.assign(option, dto);
    return this.questionOptionRepository.save(option);
  }

  async remove(id: number): Promise<void> {
    const result = await this.questionOptionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Option not found');
    }
  }
}
