import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Profile } from 'src/common/typeorm/entities/profile.entity';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
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

  async findOneByUserId(id: number): Promise<Profile | undefined> {
    return this.profileRepository.findOne({
      where: { userId: id },
      select: [
        'id',
        'linkedinUrl',
        'about',
        'googleId',
        'linkedinId',
        'auth_provider',
        'selfRatingDone',
        'playedQuiz',
        'takenInterview',
        'level1Assessment',
        'level2Assessment',
      ],
    });
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

  async remove(id: number): Promise<void> {
    await this.profileRepository.delete(id);
  }

  async removeByUserId(userId: number): Promise<void> {
    await this.profileRepository.delete({ userId });
  }
}
