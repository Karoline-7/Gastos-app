import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './create-categoria.dto';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly service: CategoriasService) {}

  @Get()
  listar() {
    return this.service.listar();
  }

  @Post()
  crear(@Body() dto: CreateCategoriaDto) {
    return this.service.crear(dto);
  }
}