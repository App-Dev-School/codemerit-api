import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Profile } from 'src/common/typeorm/entities/profile.entity';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(QuizResult)
    private quizResultRepository: Repository<QuizResult>,
  ) {}

  async createEmpty(manager: EntityManager): Promise<Profile> {
    const profile = manager.create(Profile);
    const savedProfile = await manager.save(profile);
    return savedProfile;
  }

  async create(profile: Profile): Promise<Profile> {
    const savedProfile = await this.profileRepository.save(profile);
    return savedProfile;
  }

  async findOne(id: number): Promise<Profile | undefined> {
    return this.profileRepository.findOne({ where: { id } });
  }

  async findOneByUserId(
    id: number,
  ): Promise<(Profile & { playedQuiz: boolean }) | undefined> {
    const profile = await this.profileRepository.findOne({
      where: { userId: id },
      select: [
        'id',
        'linkedinUrl',
        'about',
        'googleId',
        'linkedinId',
        'auth_provider',
        'selfRatingDone',
        'takenInterview',
        'level1Assessment',
        'level2Assessment',
      ],
    });
    if (!profile) return undefined;

    // playedQuiz is derived live from QuizResult rather than stored — a stored
    // flag would either need updating on every quiz submission everywhere (not
    // just the initial assessment) or drift out of sync with the actual truth,
    // which QuizResult already holds authoritatively.
    const playedQuiz =
      (await this.quizResultRepository.count({ where: { userId: id } })) > 0;

    return { ...profile, playedQuiz };
  }

  async findAll(): Promise<Profile[]> {
    return this.profileRepository.find();
  }

  async updateProfile(id: number, dto: Partial<Profile>): Promise<Profile> {
    const user = await this.findOne(id);
    if (!user) {
      throw new AppCustomException(HttpStatus.BAD_REQUEST, 'User not found.');
    }
    Object.assign(user, dto);
    return this.profileRepository.save(user);
  }

  async updateSocialProfile(
    userId: number,
    data: {
      googleId?: string;
      linkedinId?: string;
      auth_provider: string;
    },
  ): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'Profile not found.',
      );
    }

    if (data.googleId) {
      profile.googleId = data.googleId;
    }

    if (data.linkedinId) {
      profile.linkedinId = data.linkedinId;
    }

    profile.auth_provider = data.auth_provider;

    return this.profileRepository.save(profile);
  }

  async remove(id: number): Promise<void> {
    await this.profileRepository.delete(id);
  }

  async removeByUserId(userId: number): Promise<void> {
    await this.profileRepository.delete({ userId });
  }
}
