
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Gasto } from './gasto.entity';
import { Categoria } from '../categorias/categoria.entity';
import { CreateGastoDto } from './create-gasto.dto';
import { UpdateGastoDto } from './update-gasto.dto';

export interface FiltrosGastos {
  orden: 'ASC' | 'DESC';
  ordenarPor: string;
  categoriaId?: number;
  buscar?: string;
  pagina: number;
  limite: number;
}

@Injectable()
export class GastosService {
  constructor(
    @InjectRepository(Gasto)
    private readonly gastos: Repository<Gasto>,
    @InjectRepository(Categoria)
    private readonly categorias: Repository<Categoria>,
  ) {}

  // comprobamos que el gasto no esté repetido
  private async validarDuplicado(
    descripcion: string,
    monto: number,
    fecha: Date,
    excluirId?: number,
  ) {
    const existe = await this.gastos.findOne({
      where: {
        descripcion,
        monto,
        fecha,
        ...(excluirId ? { id: Not(excluirId) } : {}),
      },
    });

    if (existe) {
      throw new ConflictException('Este gasto ya está registrado');
    }
  }

  // registramos un gasto
  async crear(dto: CreateGastoDto) {
    const categoria = await this.categorias.findOneBy({
      id: dto.categoriaId,
    });

    if (!categoria) {
      throw new NotFoundException('La categoría no existe');
    }

    const descripcion = dto.descripcion.trim();
    const fecha = dto.fecha ? new Date(dto.fecha) : new Date();

    await this.validarDuplicado(descripcion, dto.monto, fecha);

    const gasto = this.gastos.create({
      descripcion,
      monto: dto.monto,
      fecha,
      categoria,
    });

    return this.gastos.save(gasto);
  }

  // listamos, filtramos, buscamos, ordenamos y paginamos
  async listar(f: FiltrosGastos) {
    const consulta = this.gastos
      .createQueryBuilder('gasto')
      .leftJoinAndSelect('gasto.categoria', 'categoria');

    // filtro por categoría
    if (f.categoriaId) {
      consulta.andWhere('categoria.id = :categoriaId', {
        categoriaId: f.categoriaId,
      });
    }

    // búsqueda por descripción
    if (f.buscar) {
      consulta.andWhere('LOWER(gasto.descripcion) LIKE :buscar', {
        buscar: `%${f.buscar.toLowerCase()}%`,
      });
    }

    // calculamos la cantidad y el total de los resultados filtrados
    const cantidad = await consulta.getCount();

    const resultado = await consulta
      .clone()
      .select('COALESCE(SUM(gasto.monto), 0)', 'suma')
      .getRawOne();

    const total = Math.round(Number(resultado?.suma ?? 0) * 100) / 100;

    // columnas permitidas para ordenar
    const columnas: Record<string, string> = {
      fecha: 'gasto.fecha',
      monto: 'gasto.monto',
      descripcion: 'gasto.descripcion',
      categoria: 'categoria.nombre',
    };

    const columna = columnas[f.ordenarPor] ?? columnas.fecha;

    // aplicamos la paginación
    const gastos = await consulta
      .orderBy(columna, f.orden)
      .addOrderBy('gasto.id', f.orden)
      .offset((f.pagina - 1) * f.limite)
      .limit(f.limite)
      .getMany();

    return {
      gastos,
      total,
      cantidad,
      pagina: f.pagina,
      totalPaginas: Math.max(Math.ceil(cantidad / f.limite), 1),
    };
  }

  // actualizamos un gasto
  async actualizar(id: number, dto: UpdateGastoDto) {
    const gasto = await this.gastos.findOneBy({ id });

    if (!gasto) {
      throw new NotFoundException('Gasto no encontrado');
    }

    if (dto.categoriaId !== undefined) {
      const categoria = await this.categorias.findOneBy({
        id: dto.categoriaId,
      });

      if (!categoria) {
        throw new NotFoundException('La categoría no existe');
      }

      gasto.categoria = categoria;
    }

    const descripcion = dto.descripcion?.trim() ?? gasto.descripcion;
    const monto = dto.monto ?? gasto.monto;
    const fecha = dto.fecha ? new Date(dto.fecha) : gasto.fecha;

    await this.validarDuplicado(descripcion, monto, fecha, id);

    gasto.descripcion = descripcion;
    gasto.monto = monto;
    gasto.fecha = fecha;

    return this.gastos.save(gasto);
  }

  // eliminamos un gasto
  async eliminar(id: number) {
    const resultado = await this.gastos.delete(id);

    if (!resultado.affected) {
      throw new NotFoundException('Gasto no encontrado');
    }
  }
}
