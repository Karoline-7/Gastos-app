
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';

import { GastosService } from './gastos.service';
import { CreateGastoDto } from './create-gasto.dto';
import { UpdateGastoDto } from './update-gasto.dto';

@Controller('gastos')
export class GastosController {
  constructor(private readonly service: GastosService) {}

  @Post()
  crear(@Body() dto: CreateGastoDto) {
    return this.service.crear(dto);
  }

  @Get()
  listar(
    @Query('orden') orden?: string,
    @Query('ordenarPor') ordenarPor?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('buscar') buscar?: string,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
  ) {
    return this.service.listar({
      orden: orden?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      ordenarPor: ordenarPor ?? 'fecha',
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
      buscar: buscar?.trim() || undefined,
      pagina: Math.max(Number(pagina) || 1, 1),
      limite: Math.min(Math.max(Number(limite) || 10, 1), 100),
    });
  }

  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGastoDto,
  ) {
    return this.service.actualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
