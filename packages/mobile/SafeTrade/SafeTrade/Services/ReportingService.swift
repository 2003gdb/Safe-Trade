import Foundation
import Combine

class ReportingService: ObservableObject {
    private let apiService: APIService
    private let catalogService: CatalogService

    init(apiService: APIService = APIService.shared, catalogService: CatalogService = CatalogService.shared) {
        self.apiService = apiService
        self.catalogService = catalogService
    }

    // MARK: - Report Creation

    /// Submit a new cybersecurity incident report
    func submitReport(_ request: CreateReportRequest) -> AnyPublisher<CreateReportResponse, Error> {
        // Prepare the URL
        guard let url = URL(string: "\(apiService.baseURL)/reportes") else {
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }

        // Create JSON request
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add authentication token if available
        if let token = apiService.authToken {
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // Encode request as JSON
        do {
            let jsonData = try JSONEncoder().encode(request)
            urlRequest.httpBody = jsonData

            #if DEBUG
            // Debug logging
            print("🔍 Sending report request:")
            print("URL: \(url)")
            #endif
        } catch {
            return Fail(error: error)
                .eraseToAnyPublisher()
        }

        return URLSession.shared.dataTaskPublisher(for: urlRequest)
            .map { output in
                #if DEBUG
                // Debug response
                print("🔍 Received response:")
                print("Status code: \((output.response as? HTTPURLResponse)?.statusCode ?? -1)")
                #endif
                return output.data
            }
            .decode(type: CreateReportResponse.self, decoder: JSONDecoder.reportDecoder)
            .catch { error in
                #if DEBUG
                print("❌ Decoding error: \(error)")
                #endif
                return Fail<CreateReportResponse, Error>(error: error)
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }

    // DISABLED: File attachment functionality removed
    // Submit reports using the standard submitReport() method instead

    // MARK: - Report Retrieval

    /// Get a specific report by ID
    func getReport(id: Int) -> AnyPublisher<Report?, Error> {
        guard let url = URL(string: "\(apiService.baseURL)/reportes/\(id)") else {
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }

        var request = URLRequest(url: url)

        // Add authentication token if available
        if let token = apiService.authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        return URLSession.shared.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: GetReportResponse.self, decoder: JSONDecoder.reportDecoder)
            .map { response in
                return response.success ? response.reporte : nil
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }

    /// Get user's reports (requires authentication)
    func getUserReports() -> AnyPublisher<[Report], Error> {
        #if DEBUG
        print("📡 ReportingService: Attempting to get user reports...")
        #endif

        guard let token = apiService.authToken else {
            #if DEBUG
            print("❌ No auth token available for user reports")
            #endif
            return Fail(error: APIError.invalidResponse)
                .eraseToAnyPublisher()
        }

        guard let url = URL(string: "\(apiService.baseURL)/reportes/user/mis-reportes") else {
            #if DEBUG
            print("❌ Invalid URL: \(apiService.baseURL)/reportes/user/mis-reportes")
            #endif
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }

        #if DEBUG
        print("🌐 Making request to: \(url)")
        #endif
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        return URLSession.shared.dataTaskPublisher(for: request)
            .handleEvents(receiveOutput: { data, response in
                #if DEBUG
                if let httpResponse = response as? HTTPURLResponse {
                    print("📊 User Reports HTTP Response Status: \(httpResponse.statusCode)")
                }
                #endif
            })
            .map(\.data)
            .decode(type: GetUserReportsResponse.self, decoder: JSONDecoder.reportDecoder)
            .map { response in
                #if DEBUG
                print("✅ User Reports decoded successfully. Success: \(response.success), Reports count: \(response.reportes.count)")
                #endif
                return response.success ? response.reportes : []
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }

    /// Get all reports (public access - no authentication required)
    func getAllReports() -> AnyPublisher<[Report], Error> {
        #if DEBUG
        print("📡 ReportingService: Attempting to get all reports...")
        #endif

        guard let url = URL(string: "\(apiService.baseURL)/reportes") else {
            #if DEBUG
            print("❌ Invalid URL: \(apiService.baseURL)/reportes")
            #endif
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }

        #if DEBUG
        print("🌐 Making request to: \(url)")
        #endif
        var request = URLRequest(url: url)

        // Add auth token if available (for AnonymousAuthGuard)
        if let token = apiService.authToken {
            #if DEBUG
            print("🔐 Adding auth token to request")
            #endif
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        } else {
            #if DEBUG
            print("🔓 No auth token - making anonymous request")
            #endif
        }

        return URLSession.shared.dataTaskPublisher(for: request)
            .handleEvents(receiveOutput: { data, response in
                #if DEBUG
                if let httpResponse = response as? HTTPURLResponse {
                    print("📊 HTTP Response Status: \(httpResponse.statusCode)")
                }
                #endif
            })
            .map(\.data)
            .decode(type: GetAllReportsResponse.self, decoder: JSONDecoder.reportDecoder)
            .map { response in
                #if DEBUG
                print("✅ Decoded response successfully. Reports count: \(response.data.count)")
                #endif
                return response.data
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
}

// MARK: - Supporting Types

struct GetReportResponse: Codable {
    let success: Bool
    let message: String?
    let reporte: Report?
}

struct GetUserReportsResponse: Codable {
    let success: Bool
    let message: String
    let reportes: [Report]
    let total: Int
}

struct GetAllReportsResponse: Codable {
    let data: [Report]
    let total: Int
    let page: Int?
    let limit: Int?
    let totalPages: Int?

    enum CodingKeys: String, CodingKey {
        case data
        case total
        case page
        case limit
        case totalPages
    }
}


// MARK: - V2 Report Operations

extension ReportingService {

    /**
     * Submit a report using V2 normalized format
     */
    func submitReportV2(_ report: CreateReportV2) async throws -> NormalizedReport {
        // Ensure catalogs are loaded
        await catalogService.ensureCatalogsLoaded()

        guard let catalogData = await catalogService.catalogData else {
            throw APIError.catalogLoadFailed
        }

        return try await apiService.createReportV2(report, catalogData: catalogData)
    }

    /**
     * Submit a report with Date-based incident time (matches DB schema)
     */
    func submitReportWithDateTime(
        attackType: String,
        impactLevel: String,
        incidentDateTime: Date,
        description: String?,
        evidenceUrl: String? = nil,
        attackOrigin: String,
        suspiciousUrl: String? = nil,
        messageContent: String? = nil,
        isAnonymous: Bool = false,
        userId: Int? = nil
    ) async throws -> Report {

        let report = CreateReportV2(
            userId: isAnonymous ? nil : userId,
            isAnonymous: isAnonymous,
            attackType: attackType,
            incidentDateTime: incidentDateTime,
            evidenceUrl: evidenceUrl,
            attackOrigin: attackOrigin,
            suspiciousUrl: suspiciousUrl,
            messageContent: messageContent,
            description: description,
            impactLevel: impactLevel
        )

        return try await submitReportV2(report)
    }

    /**
     * Get all reports with catalog details
     */
    func getReportsWithDetails() async throws -> [ReportWithDetails] {
        let response = try await apiService.getReportsWithDetails()
        // ReportWithDetails is now just an alias for Report
        return response.data
    }

    /**
     * Get user's reports with catalog details
     */
    func getUserReportsWithDetails() async throws -> [ReportWithDetails] {
        let response = try await apiService.getUserReports()
        // ReportWithDetails is now just an alias for Report
        return response.data
    }

    /**
     * Get a specific report by ID with catalog details
     */
    func getReportWithDetails(id: Int) async throws -> ReportWithDetails {
        return try await apiService.getReportById(id)
    }

    /**
     * Convert legacy report request to V2 format and submit
     */
    func submitLegacyReportAsV2(_ request: CreateReportRequest, userId: Int?) async throws -> Report {
        // Ensure catalogs are loaded
        await catalogService.ensureCatalogsLoaded()

        guard let catalogData = await catalogService.catalogData else {
            throw APIError.catalogLoadFailed
        }

        return try await apiService.createReportLegacy(request, catalogData: catalogData, userId: userId)
    }
}

// MARK: - Async/Await Convenience Methods

extension ReportingService {

    /**
     * Submit report and return as Combine publisher for compatibility
     */
    func submitReportV2Publisher(_ report: CreateReportV2) -> AnyPublisher<NormalizedReport, Error> {
        return Future { promise in
            Task {
                do {
                    let result = try await self.submitReportV2(report)
                    promise(.success(result))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .receive(on: DispatchQueue.main)
        .eraseToAnyPublisher()
    }

    /**
     * Get reports as Combine publisher for compatibility
     */
    func getReportsWithDetailsPublisher() -> AnyPublisher<[ReportWithDetails], Error> {
        return Future { promise in
            Task {
                do {
                    let result = try await self.getReportsWithDetails()
                    promise(.success(result))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .receive(on: DispatchQueue.main)
        .eraseToAnyPublisher()
    }
}

// MARK: - JSONDecoder Extension

extension JSONDecoder {
    static var reportDecoder: JSONDecoder {
        let decoder = JSONDecoder()
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        decoder.dateDecodingStrategy = .formatted(formatter)
        return decoder
    }

    static var v2Decoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }
}