
import { Module } from "@nestjs/common";
import { ReportesController } from "./reportes.controller";
import { ReportesService } from "./reportes.service";
import { ReportsRepository } from "./reports.repository";
import { CatalogRepository } from "../catalog/catalog.repository";
import { AdjuntosRepository } from "./adjuntos.repository";
import { ComunidadRepository } from "src/comunidad/comunidad.repository";
import { CatalogMappingService } from "../admin/catalog-mapping.service";
import { DbModule } from "../db/db.module";

@Module({
    imports: [DbModule],
    controllers: [ReportesController],
    providers: [
        ReportesService,
        ReportsRepository,
        CatalogRepository,
        AdjuntosRepository,
        ComunidadRepository,
        CatalogMappingService
    ],
    exports: [
        ReportesService,
        ReportsRepository,
        CatalogRepository,
        AdjuntosRepository
    ],
})
export class ReportesModule {}