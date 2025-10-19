import Foundation

// MARK: - Hardcoded Recommendations Data
struct RecommendationsData {

    // MARK: - Get Recommendation by Attack Type
    static func getRecommendation(for attackType: String) -> Recommendation? {
        // Try to get specific recommendation first
        if let recommendation = recommendations[attackType]?.first {
            return recommendation
        }

        // Fallback for invalid attack types - return general security recommendation
        return generalRecommendation
    }

    static func getAllRecommendations(for attackType: String) -> [Recommendation] {
        return recommendations[attackType] ?? []
    }

    // MARK: - Hardcoded Recommendations by Attack Type
    private static let recommendations: [String: [Recommendation]] = [
        "email": [
            Recommendation(
                id: 1,
                attackType: "email",
                titulo: "Verifica el remitente",
                contenido: "Siempre verifica la identidad del remitente antes de abrir correos de direcciones desconocidas. Revisa la dirección de correo completa y busca señales de phishing como errores ortográficos o dominios sospechosos."
            ),
            Recommendation(
                id: 2,
                attackType: "email",
                titulo: "No hagas clic en enlaces sospechosos",
                contenido: "Nunca hagas clic en enlaces de correos que no esperabas recibir. Si el mensaje parece legítimo, accede al sitio web directamente escribiendo la URL en tu navegador."
            )
        ],

        "SMS": [
            Recommendation(
                id: 3,
                attackType: "SMS",
                titulo: "Los bancos nunca piden información por SMS",
                contenido: "Ningún banco legítimo te pedirá información personal, contraseñas o códigos de verificación a través de mensajes de texto. Si recibes un SMS así, es una estafa."
            ),
            Recommendation(
                id: 4,
                attackType: "SMS",
                titulo: "No hagas clic en enlaces de SMS",
                contenido: "Evita hacer clic en enlaces recibidos por SMS, especialmente si no conoces al remitente. Los estafadores usan estos enlaces para robar información personal."
            )
        ],

        "whatsapp": [
            Recommendation(
                id: 5,
                attackType: "whatsapp",
                titulo: "No compartas códigos de verificación",
                contenido: "Nunca compartas códigos de verificación de WhatsApp con nadie. Los estafadores los usan para tomar control de tu cuenta y estafar a tus contactos."
            ),
            Recommendation(
                id: 6,
                attackType: "whatsapp",
                titulo: "Verifica la identidad del contacto",
                contenido: "Si alguien te pide dinero o información personal por WhatsApp, verifica su identidad llamándolo directamente antes de actuar."
            )
        ],

        "llamada": [
            Recommendation(
                id: 7,
                attackType: "llamada",
                titulo: "Nunca proporciones información personal por teléfono",
                contenido: "Los bancos y empresas legítimas nunca te pedirán contraseñas, números de tarjeta o información personal por teléfono. Si recibes una llamada así, cuelga."
            ),
            Recommendation(
                id: 8,
                attackType: "llamada",
                titulo: "Cuelga y llama directamente",
                contenido: "Si recibes una llamada urgente sobre tu cuenta bancaria o una empresa, cuelga y llama directamente al número oficial de la empresa para verificar."
            )
        ],

        "redes_sociales": [
            Recommendation(
                id: 9,
                attackType: "redes_sociales",
                titulo: "Configura tu perfil como privado",
                contenido: "Mantén tu perfil en redes sociales como privado y no aceptes solicitudes de amistad de personas que no conoces en la vida real."
            ),
            Recommendation(
                id: 10,
                attackType: "redes_sociales",
                titulo: "Desconfía de ofertas demasiado buenas",
                contenido: "Si ves ofertas increíbles en redes sociales, desconfía. Los estafadores usan ofertas atractivas para robar información personal o dinero."
            )
        ],

        "otro": [
            Recommendation(
                id: 11,
                attackType: "otro",
                titulo: "Mantén actualizado tu software",
                contenido: "Asegúrate de mantener tu sistema operativo, navegador y aplicaciones siempre actualizados con los últimos parches de seguridad."
            ),
            Recommendation(
                id: 12,
                attackType: "otro",
                titulo: "Usa contraseñas fuertes y únicas",
                contenido: "Crea contraseñas fuertes y únicas para cada cuenta. Considera usar un administrador de contraseñas para generar y almacenar contraseñas seguras."
            )
        ]
    ]

    // MARK: - General Recommendation for Invalid Attack Types
    private static let generalRecommendation = Recommendation(
        id: 999,
        attackType: "general",
        titulo: "Mantente seguro en línea",
        contenido: "Tu reporte ha sido enviado exitosamente. Mantén siempre actualizado tu software, usa contraseñas fuertes y únicas, y desconfía de comunicaciones no solicitadas. Gracias por ayudar a mantener segura nuestra comunidad."
    )

    // MARK: - General Security Tips
    static let generalTips = [
        "Mantén siempre actualizado tu software",
        "Usa contraseñas fuertes y únicas",
        "Desconfía de comunicaciones no solicitadas",
        "Verifica la identidad antes de compartir información",
        "Reporta actividades sospechosas para ayudar a la comunidad"
    ]

    // MARK: - Security Quotes for Display
    static let securityQuotes = [
        "La seguridad es responsabilidad de todos. Tu reporte ayuda a proteger a la comunidad.",
        "Mantente alerta: la información es tu mejor defensa contra los estafadores.",
        "Cada reporte cuenta. Juntos construimos una comunidad más segura.",
        "Tu experiencia puede salvar a otros de caer en la misma trampa.",
        "La prevención es la mejor protección. Gracias por mantenernos informados."
    ]

    // MARK: - Get Random Security Quote
    static func getRandomSecurityQuote() -> String {
        return securityQuotes.randomElement() ?? securityQuotes[0]
    }
}