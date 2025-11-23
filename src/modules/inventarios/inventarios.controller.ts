import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InventariosService } from './inventarios.service';
import { CreateInventarioDto } from './dto/create-inventarios.dto';
import { Inventario } from '../../entities/inventario.entity';

@Controller('inventarios')
export class InventariosController {
  constructor(private readonly inventariosService: InventariosService) {}

  @Post()
  create(
    @Body() createInventarioDto: CreateInventarioDto,
  ): Promise<Inventario> {
    return this.inventariosService.create(createInventarioDto);
  }

  @Get()
  findAll(): Promise<Inventario[]> {
    return this.inventariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Inventario> {
    return this.inventariosService.findOne(id);
  }
}
