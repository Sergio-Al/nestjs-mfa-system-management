import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movimiento } from '../../entities/movimiento.entity';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';

@Injectable()
export class MovimientosService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
  ) {}

  async create(createMovimientoDto: CreateMovimientoDto): Promise<Movimiento> {
    const movimiento = this.movimientoRepository.create(createMovimientoDto);
    return await this.movimientoRepository.save(movimiento);
  }

  async findAll(): Promise<Movimiento[]> {
    return await this.movimientoRepository.find();
  }

  async findOne(id: string): Promise<Movimiento> {
    return await this.movimientoRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateMovimientoDto: UpdateMovimientoDto,
  ): Promise<Movimiento> {
    await this.movimientoRepository.update(id, updateMovimientoDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.movimientoRepository.delete(id);
  }
}
