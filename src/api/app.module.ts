import { Module } from '@nestjs/common';
import { Application } from './app.service';

@Module({
  imports: [],
  providers: [Application],
})
export class AppModule { }
