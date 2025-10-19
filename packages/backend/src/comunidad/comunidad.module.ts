
import { Module } from "@nestjs/common";
import { ComunidadController } from "./comunidad.controller";
import { ComunidadService } from "./comunidad.service";
import { ComunidadRepository } from "./comunidad.repository";
import { ReportesModule } from "src/reportes/reportes.module"; // Import to use ReportesService

@Module({
    imports: [ReportesModule], // Import to reuse reportes functionality
    controllers: [ComunidadController],
    providers: [ComunidadService, ComunidadRepository],
    exports: [ComunidadService], // Export for other modules if needed
})
export class ComunidadModule {}