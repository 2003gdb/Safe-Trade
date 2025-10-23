//
//  ViewModelsTests.swift
//  SafeTradeTests
//
//  Pruebas unitarias para ViewModels de SafeTrade
//  Basadas en los Requerimientos Funcionales RF01, RF02, RF03, RF05, RF10
//

import XCTest
import Combine
@testable import SafeTrade

@MainActor
final class ViewModelsTests: XCTestCase {

    // Propiedades para pruebas
    var reportingViewModel: ReportingViewModel!
    var reportsListViewModel: ReportsListViewModel!

    override func setUp() {
        super.setUp()
    }

    override func tearDown() {
        reportingViewModel = nil
        reportsListViewModel = nil
        super.tearDown()
    }

    // Pruebas de Funcionamiento Correcto

    /// Prueba 1 - RF01: Verifica que el sistema permite reportar de forma anónima
    /// RF01: El sistema debe permitir reportar anónimamente
    func testReporteAnonimoInicializado() {
        reportingViewModel = ReportingViewModel()

        XCTAssertTrue(reportingViewModel.isAnonymous, "Por defecto, el reporte debe ser anónimo")
        XCTAssertFalse(reportingViewModel.isSubmitting, "No debe estar enviando al iniciar")
        XCTAssertFalse(reportingViewModel.showValidationErrors, "No debe mostrar errores al iniciar")
    }

    /// Prueba 2 - RF10: Verifica que el sistema puede listar reportes
    /// RF10: El sistema debe ofrecer funcionalidades para listar reportes
    func testListarReportesExitoso() {
        reportsListViewModel = ReportsListViewModel()

        XCTAssertNotNil(reportsListViewModel.allReports, "La lista de reportes debe estar inicializada")
        XCTAssertEqual(reportsListViewModel.selectedFilter, .todos, "El filtro inicial debe ser 'todos'")
        XCTAssertFalse(reportsListViewModel.showingPopup, "No debe mostrar popup al iniciar")
    }

    /// Prueba 3 - RF10: Verifica que el sistema puede filtrar reportes por estado
    /// RF10: El sistema debe ofrecer funcionalidades para filtrar reportes
    func testFiltrarReportesPorEstado() {
        let reportes = crearReportesDePrueba()
        reportsListViewModel = ReportsListViewModel()
        reportsListViewModel.allReports = reportes

        reportsListViewModel.selectedFilter = .nuevo
        reportsListViewModel.applyFilters()

        XCTAssertTrue(
            reportsListViewModel.filteredReports.allSatisfy { $0.status == "nuevo" },
            "Todos los reportes filtrados deben tener estado 'nuevo'"
        )
    }

    /// Prueba 4 - RF10: Verifica que el sistema puede buscar reportes
    /// RF10: El sistema debe ofrecer funcionalidades para buscar reportes
    func testBuscarReportesExitoso() {
        let reportes = crearReportesDePrueba()
        reportsListViewModel = ReportsListViewModel()
        reportsListViewModel.allReports = reportes

        reportsListViewModel.searchQuery = "phishing"
        reportsListViewModel.applyFilters()

        XCTAssertGreaterThan(
            reportsListViewModel.filteredReports.count,
            0,
            "Debe encontrar reportes que contengan 'phishing' en origen o descripción"
        )
    }

    // Pruebas de Funcionamiento Incorrecto

    /// Prueba 5 - RF01: Verifica que el formulario de reporte detecta campos vacíos
    /// RF01: El sistema debe validar campos requeridos antes de reportar
    func testReporteConCamposVaciosFalla() {
        reportingViewModel = ReportingViewModel()
        reportingViewModel.selectedAttackTypeId = nil
        reportingViewModel.selectedImpactId = nil
        reportingViewModel.attackOrigin = ""

        let esValido = reportingViewModel.isFormValid

        XCTAssertFalse(esValido, "El formulario debe ser inválido sin campos requeridos")
    }

    /// Prueba 6 - RF10: Verifica que la búsqueda sin resultados funciona correctamente
    /// RF10: El sistema debe manejar búsquedas sin coincidencias
    func testBuscarReportesSinResultados() {
        let reportes = crearReportesDePrueba()
        reportsListViewModel = ReportsListViewModel()
        reportsListViewModel.allReports = reportes

        reportsListViewModel.searchQuery = "texto_que_no_existe_xyz999"
        reportsListViewModel.applyFilters()

        XCTAssertEqual(
            reportsListViewModel.filteredReports.count,
            0,
            "No debe encontrar reportes con texto inexistente"
        )
    }

    /// Prueba 7 - RF10: Verifica que el filtro por estado cerrado funciona
    /// RF10: El sistema debe permitir filtrar por diferentes estados
    func testFiltrarReportesCerrados() {
        let reportes = crearReportesDePrueba()
        reportsListViewModel = ReportsListViewModel()
        reportsListViewModel.allReports = reportes

        reportsListViewModel.selectedFilter = .cerrado
        reportsListViewModel.applyFilters()

        XCTAssertTrue(
            reportsListViewModel.filteredReports.allSatisfy { $0.status == "cerrado" } ||
            reportsListViewModel.filteredReports.isEmpty,
            "Solo debe mostrar reportes cerrados o lista vacía si no hay"
        )
    }

    /// Prueba 8 - RF01: Verifica que el formulario valida campos requeridos correctamente
    /// RF01: El sistema debe validar que el reporte tenga tipo de ataque e impacto
    func testValidacionCamposRequeridosReporte() {
        reportingViewModel = ReportingViewModel()
        reportingViewModel.selectedAttackTypeId = 1
        reportingViewModel.selectedImpactId = 2
        reportingViewModel.attackOrigin = "phishing@test.com"

        let esValido = reportingViewModel.isFormValid

        XCTAssertTrue(esValido, "El formulario debe ser válido con campos requeridos completos")
    }

    // Métodos Auxiliares

    /// Crea reportes de prueba para las pruebas unitarias
    private func crearReportesDePrueba() -> [Report] {
        let reporte1 = Report(
            id: 1,
            userId: 123,
            isAnonymous: false,
            attackType: "email",
            incidentDate: Date(),
            evidenceUrl: nil,
            attackOrigin: "phishing@test.com",
            suspiciousUrl: "http://fake-bank.com",
            messageContent: "Tu cuenta ha sido bloqueada",
            description: "Recibí un correo de phishing",
            impactLevel: "robo_datos",
            status: "nuevo",
            adminNotes: nil,
            createdAt: Date(),
            updatedAt: nil
        )

        let reporte2 = Report(
            id: 2,
            userId: nil,
            isAnonymous: true,
            attackType: "SMS",
            incidentDate: Date(),
            evidenceUrl: nil,
            attackOrigin: "+1234567890",
            suspiciousUrl: nil,
            messageContent: "Has ganado un premio",
            description: "SMS sospechoso",
            impactLevel: "ninguno",
            status: "revisado",
            adminNotes: nil,
            createdAt: Date(),
            updatedAt: nil
        )

        let reporte3 = Report(
            id: 3,
            userId: 456,
            isAnonymous: false,
            attackType: "whatsapp",
            incidentDate: Date(),
            evidenceUrl: nil,
            attackOrigin: "+9876543210",
            suspiciousUrl: "http://suspicious-link.com",
            messageContent: "Haz clic aquí para verificar",
            description: "Mensaje de WhatsApp fraudulento",
            impactLevel: "cuenta_comprometida",
            status: "nuevo",
            adminNotes: nil,
            createdAt: Date(),
            updatedAt: nil
        )

        return [reporte1, reporte2, reporte3]
    }
}
