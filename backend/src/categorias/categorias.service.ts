import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './categoria.entity';
import { CreateCategoriaDto } from './create-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria) private readonly repo: Repository<Categoria>,
  ) {}

  listar() {
    return this.repo.find({ order: { nombre: 'ASC' } });
  }

  async crear(dto: CreateCategoriaDto) {
    const existe = await this.repo.findOneBy({ nombre: dto.nombre });
    if (existe) throw new ConflictException('La categoría ya existe');
    return this.repo.save(this.repo.create(dto));
  }
}