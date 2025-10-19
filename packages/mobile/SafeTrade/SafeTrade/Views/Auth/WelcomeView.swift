import SwiftUI

struct WelcomeView: View {
    @StateObject private var authService = AuthenticationService.shared
    @State private var showingLogin = false
    @State private var showingRegister = false

    var body: some View {
        NavigationView {
            ZStack {
                // Gradient background
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 161/255, green: 205/255, blue: 244/255).opacity(0.1),
                        Color(UIColor.systemBackground)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                VStack(spacing: 40) {
                    Spacer()

                    // App Logo and Title
                    VStack(spacing: 20) {
                        ZStack {
                            Circle()
                                .fill(Color(red: 161/255, green: 205/255, blue: 244/255))
                                .frame(width: 100, height: 100)

                            Image(systemName: "shield.fill")
                                .font(.system(size: 40, weight: .medium))
                                .foregroundColor(Color(red: 37/255, green: 40/255, blue: 61/255))
                        }

                        Text("Reportes Ciudadanos")
                            .font(.largeTitle)
                            .fontWeight(.semibold)
                            .foregroundColor(Color(red: 37/255, green: 40/255, blue: 61/255))

                        Text("Sistema de Reportes de Ciberseguridad")
                            .font(.headline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }

                    Spacer()

                    // Main Action Buttons
                    VStack(spacing: 20) {
                        // Anonymous Report Button
                        NavigationLink(destination: ReportSubmissionView(isAnonymous: true)) {
                            HStack {
                                Image(systemName: "person.fill.questionmark")
                                    .font(.title2)
                                Text("Reportar Anónimamente")
                                    .font(.headline)
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(red: 245/255, green: 133/255, blue: 63/255))
                            .foregroundColor(.white)
                            .cornerRadius(12)
                            .shadow(color: Color.black.opacity(0.2), radius: 4, x: 0, y: 2)
                        }

                        // Login/Register Section
                        VStack(spacing: 16) {
                            Text("¿Ya tienes cuenta?")
                                .font(.subheadline)
                                .foregroundColor(.secondary)

                            HStack(spacing: 12) {
                                // Login Button
                                Button(action: {
                                    showingLogin = true
                                }) {
                                    Text("Iniciar Sesión")
                                        .font(.headline)
                                        .fontWeight(.semibold)
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color(red: 37/255, green: 40/255, blue: 61/255))
                                        .foregroundColor(.white)
                                        .cornerRadius(12)
                                        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
                                }

                                // Register Button
                                Button(action: {
                                    showingRegister = true
                                }) {
                                    Text("Registrarse")
                                        .font(.headline)
                                        .fontWeight(.semibold)
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color(red: 161/255, green: 205/255, blue: 244/255))
                                        .foregroundColor(Color(red: 37/255, green: 40/255, blue: 61/255))
                                        .cornerRadius(12)
                                        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 24)

                    Spacer()

                    // Info Text
                    Text("Protege tu información y ayuda a tu comunidad")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                        .padding(.bottom, 30)
                }
            }
            .navigationBarHidden(true)
        }
        .sheet(isPresented: $showingLogin) {
            LoginView()
        }
        .sheet(isPresented: $showingRegister) {
            RegisterView()
        }
    }
}

struct WelcomeView_Previews: PreviewProvider {
    static var previews: some View {
        WelcomeView()
    }
}