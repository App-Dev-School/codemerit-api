import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Badge } from 'src/common/typeorm/entities/badge.entity';

const DATA_FILE = path.join(__dirname, '../data/06-badges.seed.json');

interface BadgesData {
  badges: Array<{
    code: string; name: string; description: string; content: string;
    iconUrl: string; points: number;
  }>;
}

export async function seedBadges(dataSource: DataSource): Promise<void> {
  const data: BadgesData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const badgeRepo = dataSource.getRepository(Badge);

  let created = 0;
  for (const b of data.badges) {
    const exists = await badgeRepo.findOne({ where: { code: b.code } });
    if (!exists) {
      await badgeRepo.save(badgeRepo.create(b));
      created++;
    }
  }

  const badges = await badgeRepo.find();
  console.log(`  ✔ Badges: ${badges.length} records (${created} created)`);
}
