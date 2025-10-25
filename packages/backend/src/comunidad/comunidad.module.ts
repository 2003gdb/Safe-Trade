
import { Module } from "@nestjs/common";
import { ComunidadController } from "./comunidad.controller";
import { ComunidadService } from "./comunidad.service";
import { ComunidadRepository } from "./comunidad.repository";
import { ReportesModule } from "src/reportes/reportes.module";

@Module({
    imports: [ReportesModule],
    controllers: [ComunidadController],
    providers: [ComunidadService, ComunidadRepository],
    exports: [ComunidadService],
})
export class ComunidadModule {}