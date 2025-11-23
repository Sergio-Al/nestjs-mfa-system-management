import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tienda } from '../../entities/tienda.entity';
import { CreateTiendaDto } from './dto/create-tienda.dto';
import { UpdateTiendaDto } from './dto/update-tienda.dto';

@Injectable()
export class TiendasService {
  constructor(
    @InjectRepository(Tienda)
    private readonly tiendaRepository: Repository<Tienda>,
  ) {}

  async create(createTiendaDto: CreateTiendaDto): Promise<Tienda> {
    const tienda = this.tiendaRepository.create(createTiendaDto);
    return this.tiendaRepository.save(tienda);
  }

  async findAll(): Promise<Tienda[]> {
    return this.tiendaRepository.find();
  }

  async findOne(id: string): Promise<Tienda> {
    return this.tiendaRepository.findOne({ where: { id } });
  }

  async update(id: string, updateTiendaDto: UpdateTiendaDto): Promise<Tienda> {
    await this.tiendaRepository.update(id, updateTiendaDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.tiendaRepository.delete(id);
  }
}
