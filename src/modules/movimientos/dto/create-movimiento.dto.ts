import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export enum TipoMovimiento {
  COMPRA = 'COMPRA',
  VENTA = 'VENTA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  AJUSTE = 'AJUSTE',
  DEVOLUCION = 'DEVOLUCION',
  MERMA = 'MERMA',
}

export enum EstadoMovimiento {
  PENDIENTE = 'PENDIENTE',
  EN_TRANSITO = 'EN_TRANSITO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO',
}

export class CreateMovimientoDto {
  @IsString()
  @IsNotEmpty()
  numero_movimiento: string;

  @IsUUID()
  @IsNotEmpty()
  productoId: string;

  @IsUUID()
  @IsNotEmpty()
  inventarioId: string;

  @IsUUID()
  @IsOptional()
  loteId?: string;

  @IsUUID()
  @IsOptional()
  tiendaOrigenId?: string;

  @IsUUID()
  @IsOptional()
  tiendaDestinoId?: string;

  @IsUUID()
  @IsOptional()
  proveedorId?: string;

  @IsEnum(TipoMovimiento)
  @IsNotEmpty()
  tipo: TipoMovimiento;

  @IsString()
  @IsOptional()
  motivo?: string;

  @IsNumber()
  @IsNotEmpty()
  cantidad: number;

  @IsNumber()
  @IsNotEmpty()
  costo_unitario: number;

  @IsNumber()
  @IsNotEmpty()
  costo_total: number;

  @IsNumber()
  @IsOptional()
  peso_total_kg?: number;

  @IsUUID()
  @IsNotEmpty()
  usuarioId: string;

  @IsEnum(EstadoMovimiento)
  @IsNotEmpty()
  estado: EstadoMovimiento;

  @IsDateString()
  @IsNotEmpty()
  fecha_movimiento: string;

  @IsString()
  @IsOptional()
  numero_factura?: string;

  @IsString()
  @IsOptional()
  numero_guia_remision?: string;

  @IsString()
  @IsOptional()
  vehiculo_placa?: string;

  @IsString()
  @IsOptional()
  conductor?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  sync_id?: string;

  @IsDateString()
  @IsOptional()
  last_sync?: string;

  @IsBoolean()
  @IsOptional()
  sincronizado?: boolean;
}
