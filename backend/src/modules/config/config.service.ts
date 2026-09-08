import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './config.entity';

@Injectable()
export class ConfigService {
  constructor(@InjectRepository(SystemConfig) private repo: Repository<SystemConfig>) {}

  async findAll() { return this.repo.find({ order: { key: 'ASC' } }); }

  async get(key: string) {
    const cfg = await this.repo.findOne({ where: { key } });
    return cfg?.value ?? null;
  }

  async set(key: string, value: string, userId?: string) {
    const existing = await this.repo.findOne({ where: { key } });
    if (existing) {
      await this.repo.update(existing.id, { value, updatedBy: userId });
      return this.repo.findOne({ where: { key } });
    }
    return this.repo.save(this.repo.create({ key, value, updatedBy: userId }));
  }

  async setMany(configs: { key: string; value: string }[], userId?: string) {
    const results = [];
    for (const c of configs) results.push(await this.set(c.key, c.value, userId));
    return results;
  }
}
