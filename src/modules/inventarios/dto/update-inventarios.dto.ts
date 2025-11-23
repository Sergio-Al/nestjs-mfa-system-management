import { PartialType } from '@nestjs/mapped-types';
import { CreateInventarioDto } from './create-inventarios.dto';

export class UpdateInventariosDto extends PartialType(CreateInventarioDto) {}
