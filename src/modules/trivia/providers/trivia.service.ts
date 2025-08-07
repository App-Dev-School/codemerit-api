import { HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QuestionResponseDto } from '../dtos/question-response.dto';
import { TriviaOption } from 'src/common/typeorm/entities/trivia-option.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { CreateTriviaDto } from '../dtos/create-trivia.dto';
import { TriviaTopic } from 'src/common/typeorm/entities/trivia-topic.entity';
import { GetTriviaDto } from '../dtos/get-trivia.dto';
import { TriviaOptionService } from './trivia-option.service';
import { TriviaTopicService } from './trivia-topic.service';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { UpdateTriviaDto } from '../dtos/update-trivia.dto';

@Injectable()
export class TriviaService {
  constructor(
    @InjectRepository(Question)
    private triviaRepo: Repository<Question>,
    private readonly dataSource: DataSource,
    private readonly triviaOptionRepo: TriviaOptionService,
    private readonly triviaTopicRepo: TriviaTopicService
  ) {}

  findAll() {
    return this.triviaRepo.find();
  }

  findOne(id: number) {
    return this.triviaRepo.findOne({ where: { id } });
  }

  update(id: number, data: Partial<Question>) {
    return this.triviaRepo.update(id, data);
  }

  async remove(id: number) {
    await this.triviaRepo.delete(id);
    return { deleted: true };
  }
  

  async updateTrivia(id: number, dto: UpdateTriviaDto): Promise<Question> {

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      
  const trivia = await this.findOne(id);
  
  if (!trivia) {
    throw new AppCustomException(
      HttpStatus.NOT_FOUND,
      `Trivia with id ${id} not found`,
    );
  }
  // Merge the DTO into the entity
  const updatedTrivia = this.triviaRepo.merge(trivia, dto);


      const savedTrivia = await queryRunner.manager.save(Question, updatedTrivia);
      await queryRunner.manager.delete(TriviaOption, { triviaId: id });
      await queryRunner.manager.delete(TriviaTopic, { triviaId: id });

      let optionsList: TriviaOption[] = [];
      for( const optionId of dto.options) {
        const triviaOption = new TriviaOption();
        triviaOption.triviaId = savedTrivia.id;
        triviaOption.optionId = optionId;
        optionsList.push(triviaOption);
      }
      let topicList: TriviaTopic[] = [];
      for( const topicId of dto.topicIds) {
        const topic = new TriviaTopic();
        topic.triviaId = savedTrivia.id;
        topic.topicId = topicId;
        topicList.push(topic);
      }
      await queryRunner.manager.save(TriviaOption, optionsList);
      await queryRunner.manager.save(TriviaTopic, topicList);

      await queryRunner.commitTransaction();
      return savedTrivia;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to update trivia', error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async createTrivia(dto: CreateTriviaDto): Promise<Question> {

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const triviaEntity = new Question();
      triviaEntity.question = dto.question;
      triviaEntity.subjectId = dto.subjectId;
      triviaEntity.level = dto.level;
      triviaEntity.order = dto.order;
      triviaEntity.marks = dto.marks;
      triviaEntity.status = dto.status;
      triviaEntity.hint = dto.hint ?? '';

      const savedTrivia = await queryRunner.manager.save(Question, triviaEntity);
      let optionsList: TriviaOption[] = [];
      for( const optionId of dto.options) {
        const triviaOption = new TriviaOption();
        triviaOption.triviaId = savedTrivia.id;
        triviaOption.optionId = optionId;
        optionsList.push(triviaOption);
      }
      let topicList: TriviaTopic[] = [];
      for( const topicId of dto.topicIds) {
        const topic = new TriviaTopic();
        topic.triviaId = savedTrivia.id;
        topic.topicId = topicId;
        topicList.push(topic);
      }
      await queryRunner.manager.save(TriviaOption, optionsList);
      await queryRunner.manager.save(TriviaTopic, topicList);

      await queryRunner.commitTransaction();
      return savedTrivia;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to create trivia', error.message);
    } finally {
      await queryRunner.release();
    }
  }

  
  async getTriviaList(dto: GetTriviaDto): Promise<QuestionResponseDto[]> {
    let questionResponseDto: QuestionResponseDto[] = [];
    if(dto?.subjectId){
      const triviaList = await this.findTriviaList(dto.subjectId);
      if (!triviaList) {
        throw new AppCustomException(
          HttpStatus.NOT_FOUND,
          'No trivia found for the given subject',
        );
      }
      for (const trivia of triviaList) {
        const triviaDto = new QuestionResponseDto();
        triviaDto.id = trivia.id;
        triviaDto.question = trivia.question;
        triviaDto.subjectId = trivia.subjectId;
        triviaDto.subject = trivia.subject.title;
        triviaDto.level = trivia.level;
        triviaDto.order = trivia.order;
        triviaDto.marks = trivia.marks;
        triviaDto.status = trivia.status;
        triviaDto.hint = trivia.hint || '';
        triviaDto.topics = await this.triviaTopicRepo.findTriviaTopicsByTriviaId(trivia.id);
        triviaDto.options = await this.triviaOptionRepo.findTriviaOptionsByTriviaId(trivia.id);
        questionResponseDto.push(triviaDto);
      }
    }

    return questionResponseDto;
  }
  
    async findTriviaList(
      subjectId: number,
    ): Promise<Question[] | undefined> {
      return this.triviaRepo.find({
        where: {
          subjectId: subjectId,
        }
      });
    }
}
