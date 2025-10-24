import SwiftUI

struct LoginView: View {
    @Environment(\.presentationMode) var presentationMode
    @ObservedObject private var authService = AuthenticationService.shared

    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage = ""
    @State private var showingError = false

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

                ScrollView {
                    VStack(spacing: 32) {
                        // Header with Shield Icon
                        VStack(spacing: 16) {
                            ZStack {
                                Circle()
                                    .fill(Color(red: 161/255, green: 205/255, blue: 244/255))
                                    .frame(width: 80, height: 80)

                                Image(systemName: "shield.fill")
                                    .font(.system(size: 32, weight: .medium))
                                    .foregroundColor(Color(red: 37/255, green: 40/255, blue: 61/255))
                            }

                            Text("Reportes Ciudadanos")
                                .font(.title)
                                .fontWeight(.semibold)
                                .foregroundColor(Color(red: 37/255, green: 40/255, blue: 61/255))

                            Text("Inicia sesión para continuar")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        .padding(.top, 40)

                        // Glassmorphism Card
                        VStack(spacing: 24) {
                            VStack(spacing: 4) {
                                Text("Iniciar Sesión")
                                    .font(.title2)
                                    .fontWeight(.semibold)
                                    .foregroundColor(Color(red: 37/255, green: 40/255, blue: 61/255))
                            }

                            // Form Fields
                            VStack(spacing: 16) {
                                // Email Field
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Correo electrónico")
                                        .font(.headline)
                                        .foregroundColor(Color(red: 37/255, green: 40/255, blue: 61/255))

                                    TextField("ejemplo@correo.com", text: $email)
                                        .padding()
                                        .background(Color.white)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 12)
                                                .stroke(Color(red: 161/255, green: 205/255, blue: 244/255).opacity(0.3), lineWidth: 1)
                                        )
                                        .cornerRadius(12)
                                        .keyboardType(.emailAddress)
                                        .textContentType(.emailAddress)
                                        .autocapitalization(.none)
                                        .autocorrectionDisabled()
                                }

                                // Password Field
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Contraseña")
                                        .font(.headline)
                                        .foregroundColor(Color(red: 37/255, green: 40/255, blue: 61/255))

                                    SecureField("••••••••", text: $password)
                                        .padding()
                                        .background(Color.white)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 12)
                                                .stroke(Color(red: 161/255, green: 205/255, blue: 244/255).opacity(0.3), lineWidth: 1)
                                        )
                                        .cornerRadius(12)
                                        .textContentType(.password)
                                        .autocorrectionDisabled()
                                }
                            }
                        }
                        .padding(24)
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(Color.white.opacity(0.7))
                                .background(.ultraThinMaterial)
                        )
                        .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 4)
                        .padding(.horizontal, 24)

                        // Login Button
                        Button(action: {
                            Task {
                                await loginUser()
                            }
                        }) {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .frame(maxWidth: .infinity)
                                    .padding()
                            } else {
                                Text("Iniciar Sesión")
                                    .fontWeight(.semibold)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                            }
                        }
                        .background(
                            isFormValid ?
                            Color(red: 245/255, green: 133/255, blue: 63/255) :
                            Color.gray
                        )
                        .foregroundColor(.white)
                        .cornerRadius(12)
                        .shadow(color: Color.black.opacity(0.2), radius: 4, x: 0, y: 2)
                        .disabled(!isFormValid || isLoading)
                        .padding(.horizontal, 24)

                        Spacer()
                    }
                }
            }
            .navigationTitle("")
            .navigationBarHidden(true)
        }
        .alert("Error de Autenticación", isPresented: $showingError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
        .onChange(of: authService.isAuthenticated) {
            if authService.isAuthenticated {
                presentationMode.wrappedValue.dismiss()
            }
        }
    }

    private var isFormValid: Bool {
        !email.isEmpty &&
        !password.isEmpty &&
        email.contains("@") &&
        password.count >= 8
    }

    private func loginUser() async {
        isLoading = true
        errorMessage = ""

        do {
            _ = try await authService.login(email: email, password: password)
            // Success is handled by the onChange modifier
        } catch {
            errorMessage = "Error de inicio de sesión"
            showingError = true
        }

        isLoading = false
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
    }
}