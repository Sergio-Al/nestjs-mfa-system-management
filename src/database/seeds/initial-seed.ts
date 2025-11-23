import { DataSource } from 'typeorm';
import { Rol } from '../../entities/rol.entity';
import { Tienda } from '../../entities/tienda.entity';
import { UnidadMedida } from '../../entities/unidad-medida.entity';

export async function runSeeds(dataSource: DataSource) {
  const rolRepository = dataSource.getRepository(Rol);
  const tiendaRepository = dataSource.getRepository(Tienda);
  const unidadMedidaRepository = dataSource.getRepository(UnidadMedida);

  // Create Roles
  const roles = [
    {
      nombre: 'Administrador',
      descripcion: 'Acceso total al sistema',
      permisos: {
        usuarios: ['create', 'read', 'update', 'delete'],
        productos: ['create', 'read', 'update', 'delete'],
        inventarios: ['create', 'read', 'update', 'delete'],
        movimientos: ['create', 'read', 'update', 'delete'],
        tiendas: ['create', 'read', 'update', 'delete'],
      },
    },
    {
      nombre: 'Gerente',
      descripcion: 'Gestión de operaciones',
      permisos: {
        usuarios: ['read'],
        productos: ['create', 'read', 'update'],
        inventarios: ['read', 'update'],
        movimientos: ['create', 'read', 'update'],
        tiendas: ['read'],
      },
    },
    {
      nombre: 'Vendedor',
      descripcion: 'Ventas y consultas',
      permisos: {
        productos: ['read'],
        inventarios: ['read'],
        movimientos: ['create', 'read'],
      },
    },
    {
      nombre: 'Almacenero',
      descripcion: 'Gestión de almacén',
      permisos: {
        productos: ['read'],
        inventarios: ['read', 'update'],
        movimientos: ['create', 'read', 'update'],
      },
    },
  ];

  console.log('Creating roles...');
  for (const roleData of roles) {
    const exists = await rolRepository.findOne({
      where: { nombre: roleData.nombre },
    });
    if (!exists) {
      await rolRepository.save(rolRepository.create(roleData));
      console.log(`✓ Role created: ${roleData.nombre}`);
    } else {
      console.log(`- Role already exists: ${roleData.nombre}`);
    }
  }

  // Create Tiendas
  const tiendas = [
    {
      nombre: 'Tienda Central',
      codigo: 'TC-001',
      direccion: 'Av. 6 de Agosto #123',
      ciudad: 'La Paz',
      departamento: 'La Paz',
      telefono: '+591 2-2345678',
      horario_atencion: 'Lunes a Viernes: 8:00 - 18:00, Sábados: 8:00 - 13:00',
      activo: true,
    },
    {
      nombre: 'Tienda Norte',
      codigo: 'TN-001',
      direccion: 'Av. América #456',
      ciudad: 'La Paz',
      departamento: 'La Paz',
      telefono: '+591 2-2345679',
      horario_atencion: 'Lunes a Viernes: 8:00 - 18:00, Sábados: 8:00 - 13:00',
      activo: true,
    },
    {
      nombre: 'Tienda Sur',
      codigo: 'TS-001',
      direccion: 'Av. Costanera #789',
      ciudad: 'Santa Cruz',
      departamento: 'Santa Cruz',
      telefono: '+591 3-3456789',
      horario_atencion: 'Lunes a Viernes: 8:00 - 18:00, Sábados: 8:00 - 13:00',
      activo: true,
    },
  ];

  console.log('Creating tiendas...');
  for (const tiendaData of tiendas) {
    const exists = await tiendaRepository.findOne({
      where: { codigo: tiendaData.codigo },
    });
    if (!exists) {
      await tiendaRepository.save(tiendaRepository.create(tiendaData));
      console.log(`✓ Tienda created: ${tiendaData.nombre}`);
    } else {
      console.log(`- Tienda already exists: ${tiendaData.nombre}`);
    }
  }

  // Create Unidades de Medida
  const unidadesMedida = [
    {
      nombre: 'Bolsa',
      abreviatura: 'BLS',
      tipo: 'Unidad',
      factor_conversion: 1.0,
    },
    {
      nombre: 'Metro',
      abreviatura: 'M',
      tipo: 'Longitud',
      factor_conversion: 1.0,
    },
    {
      nombre: 'Kilogramo',
      abreviatura: 'KG',
      tipo: 'Peso',
      factor_conversion: 1.0,
    },
    {
      nombre: 'Litro',
      abreviatura: 'LT',
      tipo: 'Volumen',
      factor_conversion: 1.0,
    },
    {
      nombre: 'Plancha',
      abreviatura: 'PLCH',
      tipo: 'Unidad',
      factor_conversion: 1.0,
    },
    {
      nombre: 'Pieza',
      abreviatura: 'PZA',
      tipo: 'Unidad',
      factor_conversion: 1.0,
    },
    {
      nombre: 'Metro Cuadrado',
      abreviatura: 'M2',
      tipo: 'Area',
      factor_conversion: 1.0,
    },
  ];

  console.log('Creating unidades de medida...');
  for (const unidadData of unidadesMedida) {
    const exists = await unidadMedidaRepository.findOne({
      where: { nombre: unidadData.nombre },
    });
    if (!exists) {
      await unidadMedidaRepository.save(
        unidadMedidaRepository.create(unidadData),
      );
      console.log(`✓ Unidad de medida created: ${unidadData.nombre}`);
    } else {
      console.log(`- Unidad de medida already exists: ${unidadData.nombre}`);
    }
  }

  console.log('\n✅ Seeds completed successfully!');
}
