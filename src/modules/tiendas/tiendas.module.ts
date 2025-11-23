import { Module } from '@nestjs/common';
import { TiendasService } from './tiendas.service';
import { TiendasController } from './tiendas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tienda } from '../../entities/tienda.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tienda])],
  controllers: [TiendasController],
  providers: [TiendasService],
})
export class TiendasModule {}
