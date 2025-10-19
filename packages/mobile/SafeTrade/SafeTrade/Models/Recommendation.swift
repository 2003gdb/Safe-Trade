import Foundation

// MARK: - Simple Recommendation Model for Hardcoded Data
struct Recommendation: Identifiable {
    let id: Int
    let attackType: String
    let titulo: String
    let contenido: String

    enum AttackType: String, CaseIterable {
        case email = "email"
        case sms = "SMS"
        case whatsapp = "whatsapp"
        case llamada = "llamada"
        case redesSociales = "redes_sociales"
        case otro = "otro"

        var displayName: String {
            switch self {
            case .email: return "Correo Electrónico"
            case .sms: return "SMS"
            case .whatsapp: return "WhatsApp"
            case .llamada: return "Llamada Telefónica"
            case .redesSociales: return "Redes Sociales"
            case .otro: return "Otros"
            }
        }
    }
}


#if DEBUG
// MARK: - Sample Data for Preview (Debug Only)
extension Recommendation {
    static let sampleData = [
        Recommendation(
            id: 1,
            attackType: "email",
            titulo: "Verifica remitentes desconocidos",
            contenido: "Siempre verifica la identidad del remitente antes de abrir correos de direcciones desconocidas. Revisa la dirección de correo completa y busca señales de phishing."
        ),
        Recommendation(
            id: 2,
            attackType: "whatsapp",
            titulo: "No compartas códigos de verificación",
            contenido: "Nunca compartas códigos de verificación de WhatsApp. Los estafadores los usan para tomar control de tu cuenta."
        ),
        Recommendation(
            id: 3,
            attackType: "SMS",
            titulo: "Los bancos nunca piden información por SMS",
            contenido: "Ningún banco legítimo te pedirá información personal o contraseñas a través de mensajes de texto."
        )
    ]
}
#endif