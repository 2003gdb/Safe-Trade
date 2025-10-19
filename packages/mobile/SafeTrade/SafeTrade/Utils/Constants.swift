import Foundation

struct Constants {
    struct API {
        static let baseURL = "http://localhost:3000"
        static let timeout: TimeInterval = 30.0
    }
    
    struct Keys {
        static let authToken = "auth_token"
        static let refreshToken = "refresh_token"
        static let userDefaults = "SafeTradeUserDefaults"
    }
    
    struct Endpoints {
        static let login = "/auth/login"
        static let register = "/auth/register"
        static let reports = "/reportes"
        static let community = "/tendencias-comunidad"
    }
    
    struct FileUpload {
        static let maxFileSize: Int64 = 10 * 1024 * 1024 // 10MB
        static let allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    }
}