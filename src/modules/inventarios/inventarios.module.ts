import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventario } from '../../entities/inventario.entity';
import { InventariosController } from './inventarios.controller';
import { InventariosService } from './inventarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inventario])],
  controllers: [InventariosController],
  providers: [InventariosService],
  exports: [InventariosService],
})
export class InventariosModule {}