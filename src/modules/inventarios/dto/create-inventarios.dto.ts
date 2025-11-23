import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateInventarioDto {
  @IsUUID()
  @IsNotEmpty()
  productoId: string;

  @IsUUID()
  @IsNotEmpty()
  almacenId: string;

  @IsUUID()
  @IsNotEmpty()
  tiendaId: string;

  @IsUUID()
  @IsOptional()
  loteId?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  cantidad_actual: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  cantidad_reservada: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  cantidad_disponible: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  valor_total: number;

  @IsString()
  @IsNotEmpty()
  ubicacion_fisica: string;

  @IsDateString()
  @IsNotEmpty()
  ultima_actualizacion: string;

  @IsString()
  @IsOptional()
  sync_id?: string;

  @IsDateString()
  @IsOptional()
  last_sync?: string;
}
