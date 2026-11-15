import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriasModule } from './categorias/categorias.module';
import { Categoria } from './categorias/categoria.entity';
import { Gasto } from './gastos/gasto.entity';
import { GastosModule } from './gastos/gastos.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
TypeOrmModule.forRoot({
  type: 'sqljs',
  location: 'gastos.db',
  autoSave: true,
 entities: [Categoria, Gasto],
  synchronize: true,
}),
    CategoriasModule,
    GastosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}