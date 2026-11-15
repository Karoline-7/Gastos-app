
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
} from '@nestjs/common';

import { GastosService } from './gastos.service';
import { CreateGastoDto } from './create-gasto.dto';

@Controller('gastos')
export class GastosController {
  constructor(private readonly service: GastosService) {}

  @Post()
  crear(@Body() dto: CreateGastoDto) {
    return this.service.crear(dto);
  }

  @Get()
  listar(@Query('orden') orden?: string) {
    return this.service.listar(
      orden?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    );
  }

  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateGastoDto,
  ) {
    return this.service.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
