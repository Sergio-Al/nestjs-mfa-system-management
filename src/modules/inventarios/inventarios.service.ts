import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventario } from '../../entities/inventario.entity';
import { CreateInventarioDto } from './dto/create-inventarios.dto';
import { UpdateInventariosDto } from './dto/update-inventarios.dto';

@Injectable()
export class InventariosService {
  constructor(
    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,
  ) {}

  async create(createInventarioDto: CreateInventarioDto): Promise<Inventario> {
    const inventario = this.inventarioRepository.create(createInventarioDto);
    return this.inventarioRepository.save(inventario);
  }

  async findAll(): Promise<Inventario[]> {
    return this.inventarioRepository.find();
  }

  async findOne(id: string): Promise<Inventario> {
    return this.inventarioRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateInventariosDto: UpdateInventariosDto,
  ): Promise<Inventario> {
    await this.inventarioRepository.update(id, updateInventariosDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.inventarioRepository.delete(id);
  }
}
