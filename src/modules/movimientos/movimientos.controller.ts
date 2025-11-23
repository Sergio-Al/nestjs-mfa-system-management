import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { Movimiento } from '../../entities/movimiento.entity';

@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Post()
  create(@Body() createMovimientoDto: CreateMovimientoDto): Promise<Movimiento> {
    return this.movimientosService.create(createMovimientoDto);
  }

  @Get()
  findAll(): Promise<Movimiento[]> {
    return this.movimientosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Movimiento> {
    return this.movimientosService.findOne(id);
  }
}