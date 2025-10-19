import Foundation
import Combine

/**
 * CatalogService handles loading, caching, and managing catalog data
 * for attack types, impacts, and statuses from the backend API.
 */
@MainActor
class CatalogService: ObservableObject {
    static let shared = CatalogService()

    // MARK: - Published Properties
    @Published var catalogData: CatalogData?
    @Published var isLoading = false
    @Published var lastError: Error?

    // MARK: - Private Properties
    private let apiService = APIService.shared
    private var catalogCache: CatalogCache?
    private let cacheKey = "catalog_cache_v2"
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Initialization
    private init() {
        loadCachedCatalog()
    }

    // MARK: - Public Methods

    /**
     * Load catalogs from API or cache
     */
    func loadCatalogs(forceRefresh: Bool = false) async {
        // Return cached data if available and not forcing refresh
        if !forceRefresh, let cache = catalogCache, !cache.isExpired {
            catalogData = cache.data
            return
        }

        isLoading = true
        lastError = nil

        do {
            let response: CatalogResponse = try await apiService.request(
                endpoint: "/reportes/catalogs",
                method: .GET,
                responseType: CatalogResponse.self
            )

            // Use the data property from the response
            let newCatalogData = response.data

            // Update cache
            let newCache = CatalogCache(
                data: newCatalogData,
                lastUpdated: Date(),
                version: "2.0"
            )

            catalogCache = newCache
            catalogData = newCatalogData

            // Persist to UserDefaults
            saveCacheToUserDefaults(newCache)

        } catch {
            lastError = error

            // Fallback to cached data if available
            if let cache = catalogCache {
                catalogData = cache.data
            }
        }

        isLoading = false
    }

    /**
     * Get catalog helper for string-based operations
     */
    func getCatalogHelper() -> CatalogHelper? {
        guard let catalogData = catalogData else { return nil }
        return CatalogHelper(catalogData: catalogData)
    }

    /**
     * Check if catalogs are loaded and available
     */
    var isReady: Bool {
        return catalogData != nil
    }

    /**
     * Get attack type options for pickers (string-based for backend compatibility)
     */
    var attackTypeOptions: [(value: String, displayName: String)] {
        return catalogData?.attackTypes.map { (value: $0.name, displayName: getLocalizedName(for: $0.name)) } ?? []
    }

    /**
     * Get impact options for pickers (string-based for backend compatibility)
     */
    var impactOptions: [(value: String, displayName: String)] {
        return catalogData?.impacts.map { (value: $0.name, displayName: getLocalizedName(for: $0.name)) } ?? []
    }

    /**
     * Get status options for pickers (string-based for backend compatibility)
     */
    var statusOptions: [(value: String, displayName: String)] {
        return catalogData?.statuses.map { (value: $0.name, displayName: getLocalizedName(for: $0.name)) } ?? []
    }

    /**
     * Get display name for attack type string value
     */
    func getAttackTypeDisplayName(_ value: String) -> String {
        return getLocalizedName(for: value)
    }

    /**
     * Get display name for impact string value
     */
    func getImpactDisplayName(_ value: String) -> String {
        return getLocalizedName(for: value)
    }

    /**
     * Get display name for status string value
     */
    func getStatusDisplayName(_ value: String) -> String {
        return getLocalizedName(for: value)
    }

    /**
     * Validate if an attack type value exists
     */
    func isValidAttackType(_ value: String) -> Bool {
        return catalogData?.attackTypes.contains { $0.name == value } ?? false
    }

    /**
     * Validate if an impact value exists
     */
    func isValidImpact(_ value: String) -> Bool {
        return catalogData?.impacts.contains { $0.name == value } ?? false
    }

    /**
     * Validate if a status value exists
     */
    func isValidStatus(_ value: String) -> Bool {
        return catalogData?.statuses.contains { $0.name == value } ?? false
    }

    // MARK: - Cache Management

    private func loadCachedCatalog() {
        guard let data = UserDefaults.standard.data(forKey: cacheKey) else {
            return
        }

        do {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            let cache = try decoder.decode(CatalogCache.self, from: data)

            catalogCache = cache
            catalogData = cache.data

        } catch {
            UserDefaults.standard.removeObject(forKey: cacheKey)
        }
    }

    private func saveCacheToUserDefaults(_ cache: CatalogCache) {
        do {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(cache)
            UserDefaults.standard.set(data, forKey: cacheKey)

        } catch {
            // Silent fail - cache saving is not critical
        }
    }

    /**
     * Clear cached catalog data
     */
    func clearCache() {
        catalogCache = nil
        catalogData = nil
        UserDefaults.standard.removeObject(forKey: cacheKey)
    }

    /**
     * Get cache status information
     */
    var cacheInfo: (isExpired: Bool, lastUpdated: Date?) {
        guard let cache = catalogCache else {
            return (isExpired: true, lastUpdated: nil)
        }

        return (isExpired: cache.isExpired, lastUpdated: cache.lastUpdated)
    }
}

// MARK: - Error Types
enum CatalogError: Error, LocalizedError {
    case notLoaded
    case loadFailed(Error)
    case invalidData
    case cacheCorrupted

    var errorDescription: String? {
        switch self {
        case .notLoaded:
            return "Los catálogos no están cargados"
        case .loadFailed(let error):
            return "Error cargando catálogos: \(error.localizedDescription)"
        case .invalidData:
            return "Datos de catálogo inválidos"
        case .cacheCorrupted:
            return "Caché de catálogo corrupto"
        }
    }
}

// MARK: - Convenience Extensions
extension CatalogService {
    /**
     * Ensure catalogs are loaded, loading them if necessary
     */
    func ensureCatalogsLoaded() async {
        if catalogData == nil {
            await loadCatalogs()
        }

        // Double-check that we have attack types after loading
        if let data = catalogData, data.attackTypes.isEmpty {
            await loadCatalogs(forceRefresh: true)
        }
    }

    /**
     * Get localized display name for catalog items
     */
    func getLocalizedName(for catalogItem: String) -> String {
        let localizations: [String: String] = [
            "email": "Correo Electrónico",
            "SMS": "Mensaje de Texto",
            "whatsapp": "WhatsApp",
            "llamada": "Llamada Telefónica",
            "redes_sociales": "Redes Sociales",
            "otro": "Otro",
            "ninguno": "Sin Impacto",
            "robo_datos": "Robo de Datos",
            "robo_dinero": "Robo de Dinero",
            "cuenta_comprometida": "Cuenta Comprometida",
            "nuevo": "Nuevo",
            "revisado": "Revisado",
            "en_investigacion": "En Investigación",
            "cerrado": "Cerrado"
        ]

        return localizations[catalogItem] ?? catalogItem.capitalized
    }
}