import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Platform } from 'src/platform/entities/platform.entity';
import { spawn } from 'child_process';
import { CommandBuilder } from 'src/utils/command-builder';

@Injectable()
export class PlatformService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>
  ) {}

  async create(createPlatformDto: CreatePlatformDto) {
    if (await this.platformRepository.exists({ where: { name: createPlatformDto.name } })) {
      throw new BadRequestException("This platform already existed");
    }

    return new Promise((resolve, reject) => {
      // Prototyping
      const platform = this.platformRepository.create({
        ...createPlatformDto
      });

      const command = CommandBuilder.dockerCommand();
      command.pull(createPlatformDto.dockerImage);

      // Spawn the process
      const cp = spawn(command.toString(), {
        stdio: [null, process.stdout, process.stderr],
        shell: true
      });

      // Process successfully completed
      cp.on("close", (code, signal) => {
        resolve(this.platformRepository.save(platform));
      });

      // Process error
      cp.on("error", (err) => {
        reject(err);
      });
    });
  }

  findAll() {
    return this.platformRepository.find();
  }

  async findOne(id: number) {
    const platform = await this.platformRepository.findOne({ where: { id: id } });
    if (!platform) {
      throw new BadRequestException("Platform not found");
    }
    return platform;
  }

  remove(id: number) {
    return this.platformRepository.delete({ id: id });
  }
}
