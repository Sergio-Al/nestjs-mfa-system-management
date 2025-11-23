import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTiendaDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsNotEmpty()
  @IsString()
  activo: boolean;
}
