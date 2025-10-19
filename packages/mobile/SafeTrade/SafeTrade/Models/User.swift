import Foundation

struct User: Codable, Identifiable {
    let id: Int
    let email: String
    let name: String

    enum CodingKeys: String, CodingKey {
        case id, email, name
    }

    // Note: Password and salt are never stored on client side
    // Authentication is handled via JWT tokens
}