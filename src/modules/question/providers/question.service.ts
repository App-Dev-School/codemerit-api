import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  create(data: Partial<Question>) {
    const question = this.questionRepo.create(data);
    return this.questionRepo.save(question);
  }

  findAll() {
    return this.questionRepo.find();
  }

  findOne(id: number) {
    return this.questionRepo.findOne({ where: { id } });
  }

  update(id: number, data: Partial<Question>) {
    return this.questionRepo.update(id, data);
  }

  async remove(id: number) {
    await this.questionRepo.delete(id);
    return { deleted: true };
  }
}
