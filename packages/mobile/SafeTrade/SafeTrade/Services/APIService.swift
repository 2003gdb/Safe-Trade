import Foundation
import Combine
import UIKit

class APIService {
    static let shared = APIService()

    let baseURL = "http://localhost:3000"
    var authToken: String?

    private init() {}

    func setAuthToken(_ token: String?) {
        self.authToken = token
    }
    
    func request<T: Codable>(
        endpoint: String,
        method: HTTPMethod = .GET,
        body: Data? = nil,
        headers: [String: String] = [:],
        responseType: T.Type
    ) async throws -> T {
        let fullURL = "\(baseURL)\(endpoint)"
        print("🌐 API Request: \(method.rawValue) \(fullURL)")

        if let body = body, let bodyString = String(data: body, encoding: .utf8) {
            print("📤 Request Body: \(bodyString)")
        }

        guard let url = URL(string: fullURL) else {
            print("❌ Invalid URL: \(fullURL)")
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.httpBody = body
        
        // Add default headers
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        // Add authorization header if token exists
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // Add custom headers
        for (key, value) in headers {
            request.setValue(value, forHTTPHeaderField: key)
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        print("📡 Response Status: \(httpResponse.statusCode)")

        if let responseString = String(data: data, encoding: .utf8) {
            print("📥 Response Body: \(responseString)")
        }

        guard 200...299 ~= httpResponse.statusCode else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        do {
            let decodedResponse = try JSONDecoder().decode(responseType, from: data)
            print("✅ Successful decoding")
            return decodedResponse
        } catch {
            print("❌ Decoding Error: \(error)")
            if let decodingError = error as? DecodingError {
                switch decodingError {
                case .keyNotFound(let key, let context):
                    print("Missing key: \(key.stringValue) - \(context.debugDescription)")
                case .typeMismatch(let type, let context):
                    print("Type mismatch for type: \(type) - \(context.debugDescription)")
                case .valueNotFound(let type, let context):
                    print("Value not found for type: \(type) - \(context.debugDescription)")
                case .dataCorrupted(let context):
                    print("Data corrupted: \(context.debugDescription)")
                @unknown default:
                    print("Unknown decoding error")
                }
            }
            throw APIError.decodingError
        }
    }
}

enum HTTPMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case DELETE = "DELETE"
    case PATCH = "PATCH"
}

enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case serverError(Int)
    case decodingError
    case catalogLoadFailed
    case invalidData

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL inválida"
        case .invalidResponse:
            return "Respuesta inválida del servidor"
        case .serverError(let code):
            return "Error del servidor: \(code)"
        case .decodingError:
            return "Error al procesar la respuesta"
        case .catalogLoadFailed:
            return "Error cargando catálogos"
        case .invalidData:
            return "Datos inválidos"
        }
    }
}

// MARK: - V2 API Methods
extension APIService {

    // MARK: - Catalog Operations

    /**
     * Get all catalogs (attack types, impacts, statuses)
     */
    func getCatalogs() async throws -> CatalogResponse {
        return try await request(
            endpoint: "/reportes/catalogs",
            method: .GET,
            responseType: CatalogResponse.self
        )
    }

    // MARK: - Report Operations V2

    /**
     * Create a new report using V2 format
     * Encoder automatically splits Date into strings for backend
     */
    func createReportV2(_ report: CreateReportV2, catalogData: CatalogData) async throws -> Report {
        let encoder = JSONEncoder()
        let body = try encoder.encode(report)  // Encoder splits incidentDate → date/time strings

        // Call endpoint and get response
        let response: CreateReportResponse = try await self.request(
            endpoint: "/reportes",
            method: .POST,
            body: body,
            responseType: CreateReportResponse.self
        )

        // Get the created report ID from response summary
        guard let reportSummary = response.reporte else {
            throw APIError.invalidData
        }

        // Fetch full report details from backend
        // This ensures we get complete data with proper decoder handling
        return try await getReportById(reportSummary.id)
    }

    /**
     * Get all reports with details (including catalog names)
     */
    func getReportsWithDetails() async throws -> ReportsListResponse {
        return try await request(
            endpoint: "/reportes",
            method: .GET,
            responseType: ReportsListResponse.self
        )
    }

    /**
     * Get user's reports (requires authentication)
     */
    func getUserReports() async throws -> ReportsListResponse {
        return try await request(
            endpoint: "/reportes/user/mis-reportes",
            method: .GET,
            responseType: ReportsListResponse.self
        )
    }

    /**
     * Get a specific report by ID
     */
    func getReportById(_ id: Int) async throws -> ReportWithDetails {
        // Backend returns wrapped response: {success, reporte}
        struct GetReportByIdResponse: Codable {
            let success: Bool
            let reporte: ReportWithDetails?
            let message: String?
        }

        let response: GetReportByIdResponse = try await request(
            endpoint: "/reportes/\(id)",
            method: .GET,
            responseType: GetReportByIdResponse.self
        )

        guard let report = response.reporte else {
            throw APIError.invalidData
        }

        return report
    }

    // MARK: - Photo Upload

    /**
     * Upload a photo for evidence
     * Returns the URL path to the uploaded photo
     */
    func uploadPhoto(image: UIImage) async throws -> String {
        let fullURL = "\(baseURL)/reportes/upload-photo"
        guard let url = URL(string: fullURL) else {
            throw APIError.invalidURL
        }

        // Convert image to JPEG data
        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            throw APIError.invalidData
        }

        // Create multipart form data
        let boundary = UUID().uuidString
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        // Add authorization header if token exists
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        var body = Data()

        // Add image data
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"photo\"; filename=\"photo.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n".data(using: .utf8)!)
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        print("🖼️ Uploading photo (\(imageData.count) bytes)")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        print("📡 Upload Response Status: \(httpResponse.statusCode)")

        guard 200...299 ~= httpResponse.statusCode else {
            throw APIError.serverError(httpResponse.statusCode)
        }

        // Parse response to get URL
        struct UploadResponse: Codable {
            let success: Bool
            let message: String
            let url: String
        }

        let uploadResponse = try JSONDecoder().decode(UploadResponse.self, from: data)

        guard uploadResponse.success else {
            throw APIError.invalidResponse
        }

        print("✅ Photo uploaded: \(uploadResponse.url)")
        return uploadResponse.url
    }

    // MARK: - Legacy Compatibility

    /**
     * Create report using legacy format (converts to V2 internally)
     */
    func createReportLegacy(_ request: CreateReportRequest, catalogData: CatalogData, userId: Int?) async throws -> Report {
        // Combine legacy date+time strings into single Date
        let dateTimeString = request.incidentDate + "T" + (request.incidentTime ?? "00:00:00")
        let isoFormatter = ISO8601DateFormatter()
        guard let incidentDateTime = isoFormatter.date(from: dateTimeString) else {
            throw APIError.invalidData
        }

        let reportV2 = CreateReportV2(
            userId: request.isAnonymous ? nil : userId,
            isAnonymous: request.isAnonymous,
            attackType: request.attackType,
            incidentDateTime: incidentDateTime,
            evidenceUrl: request.evidenceUrl,
            attackOrigin: request.attackOrigin,
            suspiciousUrl: request.suspiciousUrl,
            messageContent: request.messageContent,
            description: request.description,
            impactLevel: request.impactLevel
        )

        return try await createReportV2(reportV2, catalogData: catalogData)
    }
}
