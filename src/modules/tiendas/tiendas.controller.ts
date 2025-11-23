import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TiendasService } from './tiendas.service';
import { CreateTiendaDto } from './dto/create-tienda.dto';
import { Tienda } from '../../entities/tienda.entity';

@Controller('tiendas')
export class TiendasController {
  constructor(private readonly tiendasService: TiendasService) {}

  @Post()
  create(@Body() createTiendaDto: CreateTiendaDto): Promise<Tienda> {
    return this.tiendasService.create(createTiendaDto);
  }

  @Get()
  findAll(): Promise<Tienda[]> {
    return this.tiendasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Tienda> {
    return this.tiendasService.findOne(id);
  }
}
