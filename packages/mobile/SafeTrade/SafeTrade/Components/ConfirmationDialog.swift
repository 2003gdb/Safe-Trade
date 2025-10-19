import SwiftUI

struct ConfirmationDialog: View {
    let title: String
    let message: String
    let confirmButtonText: String
    let confirmButtonColor: Color
    let onConfirm: () -> Void
    let onCancel: () -> Void

    @State private var isVisible = false

    init(
        title: String,
        message: String,
        confirmButtonText: String = "Confirmar",
        confirmButtonColor: Color = .red,
        onConfirm: @escaping () -> Void,
        onCancel: @escaping () -> Void
    ) {
        self.title = title
        self.message = message
        self.confirmButtonText = confirmButtonText
        self.confirmButtonColor = confirmButtonColor
        self.onConfirm = onConfirm
        self.onCancel = onCancel
    }

    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture {
                    onCancel()
                }

            VStack(spacing: 20) {
                VStack(spacing: 12) {
                    Text(title)
                        .font(.title2)
                        .fontWeight(.semibold)
                        .multilineTextAlignment(.center)

                    Text(message)
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                }

                HStack(spacing: 12) {
                    Button("Cancelar") {
                        onCancel()
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color(.systemGray5))
                    .foregroundColor(.primary)
                    .cornerRadius(8)

                    Button(confirmButtonText) {
                        onConfirm()
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(confirmButtonColor)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
            }
            .padding(24)
            .background(Color(.systemBackground))
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 4)
            .padding(.horizontal, 32)
            .scaleEffect(isVisible ? 1.0 : 0.8)
            .opacity(isVisible ? 1.0 : 0.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isVisible)
        }
        .onAppear {
            isVisible = true
        }
    }
}

struct ConfirmationDialogModifier: ViewModifier {
    @Binding var isPresented: Bool
    let title: String
    let message: String
    let confirmButtonText: String
    let confirmButtonColor: Color
    let onConfirm: () -> Void

    func body(content: Content) -> some View {
        content
            .overlay(
                Group {
                    if isPresented {
                        ConfirmationDialog(
                            title: title,
                            message: message,
                            confirmButtonText: confirmButtonText,
                            confirmButtonColor: confirmButtonColor,
                            onConfirm: {
                                onConfirm()
                                isPresented = false
                            },
                            onCancel: {
                                isPresented = false
                            }
                        )
                    }
                }
            )
    }
}

extension View {
    func confirmationDialog(
        isPresented: Binding<Bool>,
        title: String,
        message: String,
        confirmButtonText: String = "Confirmar",
        confirmButtonColor: Color = .red,
        onConfirm: @escaping () -> Void
    ) -> some View {
        modifier(ConfirmationDialogModifier(
            isPresented: isPresented,
            title: title,
            message: message,
            confirmButtonText: confirmButtonText,
            confirmButtonColor: confirmButtonColor,
            onConfirm: onConfirm
        ))
    }
}

#Preview {
    VStack {
        Text("Contenido de la app")
            .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    .overlay(
        ConfirmationDialog(
            title: "¿Cambiar correo electrónico?",
            message: "Esta acción requerirá que confirmes tu identidad. ¿Estás seguro de que quieres continuar?",
            confirmButtonText: "Sí, cambiar",
            confirmButtonColor: .blue,
            onConfirm: {},
            onCancel: {}
        )
    )
}