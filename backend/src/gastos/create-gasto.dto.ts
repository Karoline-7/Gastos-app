
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateGastoDto {
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNumber()
  @IsPositive()
  monto: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsInt()
  categoriaId: number;
}
