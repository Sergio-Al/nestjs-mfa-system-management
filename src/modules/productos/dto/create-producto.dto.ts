import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsUUID()
  @IsNotEmpty()
  categoriaId: string;

  @IsUUID()
  @IsNotEmpty()
  unidadMedidaId: string;

  @IsUUID()
  @IsNotEmpty()
  proveedorPrincipalId: string;

  @IsNumber()
  @IsNotEmpty()
  precioCompra: number;

  @IsNumber()
  @IsNotEmpty()
  precioVenta: number;

  @IsNumber()
  @IsOptional()
  pesoUnitarioKg?: number;

  @IsNumber()
  @IsOptional()
  volumenUnitarioM3?: number;

  @IsNumber()
  @IsOptional()
  stockMinimo?: number;

  @IsNumber()
  @IsOptional()
  stockMaximo?: number;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  gradoCalidad?: string;

  @IsString()
  @IsOptional()
  normaTecnica?: string;

  @IsBoolean()
  @IsOptional()
  requiereAlmacenCubierto?: boolean;

  @IsBoolean()
  @IsOptional()
  materialPeligroso?: boolean;

  @IsString()
  @IsOptional()
  imagenUrl?: string;

  @IsString()
  @IsOptional()
  fichaTecnicaUrl?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
