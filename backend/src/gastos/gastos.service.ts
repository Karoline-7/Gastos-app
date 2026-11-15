import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gasto } from './gasto.entity';
import { Categoria } from '../categorias/categoria.entity';
import { CreateGastoDto } from './create-gasto.dto';
import { UpdateGastoDto } from './update-gasto.dto';

@Injectable()
export class GastosService {
  constructor(
    @InjectRepository(Gasto) private readonly gastos: Repository<Gasto>,
    @InjectRepository(Categoria) private readonly categorias: Repository<Categoria>,
  ) {}

  async crear(dto: CreateGastoDto) {
    const categoria = await this.categorias.findOneBy({ id: dto.categoriaId });
    if (!categoria) throw new NotFoundException('La categoría no existe');

    const gasto = this.gastos.create({
      descripcion: dto.descripcion,
      monto: dto.monto,
      fecha: dto.fecha ? new Date(dto.fecha) : new Date(),
      categoria,
    });
    return this.gastos.save(gasto);
  }

  async listar(orden: 'ASC' | 'DESC' = 'DESC') {
    const gastos = await this.gastos.find({ order: { fecha: orden, id: orden } });
    const suma = gastos.reduce((acc, g) => acc + g.monto, 0);
    return { gastos, total: Math.round(suma * 100) / 100 };
  }

  async actualizar(id: number, dto: UpdateGastoDto) {
    const gasto = await this.gastos.findOneBy({ id });
    if (!gasto) throw new NotFoundException('Gasto no encontrado');

    if (dto.categoriaId !== undefined) {
      const categoria = await this.categorias.findOneBy({ id: dto.categoriaId });
      if (!categoria) throw new NotFoundException('La categoría no existe');
      gasto.categoria = categoria;
    }
    if (dto.descripcion !== undefined) gasto.descripcion = dto.descripcion;
    if (dto.monto !== undefined) gasto.monto = dto.monto;
    if (dto.fecha !== undefined) gasto.fecha = new Date(dto.fecha);

    return this.gastos.save(gasto);
  }

  async eliminar(id: number) {
    const res = await this.gastos.delete(id);
    if (!res.affected) throw new NotFoundException('Gasto no encontrado');
  }
}