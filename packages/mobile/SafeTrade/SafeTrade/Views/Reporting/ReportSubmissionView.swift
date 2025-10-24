import SwiftUI

struct ReportSubmissionView: View {
    let isAnonymous: Bool
    @StateObject private var viewModel: ReportingViewModel
    @Environment(\.presentationMode) var presentationMode
    @Environment(\.dismiss) private var dismiss

    @State private var showingImagePicker = false
    @State private var imageSourceType: UIImagePickerController.SourceType = .photoLibrary

    init(isAnonymous: Bool = false) {
        self.isAnonymous = isAnonymous
        self._viewModel = StateObject(wrappedValue: ReportingViewModel(isAnonymous: isAnonymous))
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: DesignSystem.Spacing.xxl) {
                    // Report Type Indicator (static)
                    reportTypeIndicator

                    // Contact Type Section (following /inpo "tipo de primer contacto")
                    contactTypeSection

                    // Conditional Contact Details (like /inpo renderContactField)
                    conditionalContactDetailsSection

                    // Incident Details Section (date/time)
                    incidentDetailsSection

                    // Impact Assessment Section (like /inpo "¿han habido daños?")
                    impactSection

                    // Additional Information
                    additionalInfoSection

                    // Incident Description (moved to bottom)
                    incidentDescriptionSection

                    // Photo Evidence Section
                    photoEvidenceSection

                    // Submit Button
                    submitButton

                    Spacer()
                }
                .padding(.horizontal, DesignSystem.Spacing.xl)
                .padding(.top, DesignSystem.Spacing.sm)
                .padding(.bottom, DesignSystem.Spacing.lg)
            }
            .bmadBackgroundGradient()
            .navigationTitle("Nuevo Reporte")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancelar") {
                        dismiss()
                    }
                    .foregroundColor(DesignSystem.Colors.safetradeOrange)
                }
            }
        }
        .fullScreenCover(isPresented: $viewModel.showingSuccessAlert) {
            if let _ = viewModel.lastSubmittedReport,
               let attackType = viewModel.lastSubmittedAttackType {
                // Show recommendations view based on attack type
                RecommendationsView(attackType: attackType) {
                    // Close the fullScreenCover first
                    viewModel.showingSuccessAlert = false
                    // Reset form now that we're done with the data
                    viewModel.resetForm()
                    // Then dismiss the report view after a small delay to avoid navigation conflicts
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
        .alert("Error", isPresented: $viewModel.showingErrorAlert) {
            Button("Aceptar") { }
        } message: {
            Text(viewModel.alertMessage)
        }
    }

    // MARK: - Report Type Indicator (static display)
    private var reportTypeIndicator: some View {
        VStack(alignment: .leading, spacing: DesignSystem.Spacing.md) {
            HStack {
                Image(systemName: isAnonymous ? "person.fill.questionmark" : "person.fill.badge.plus")
                    .foregroundColor(DesignSystem.Colors.safetradeOrange)
                Text(isAnonymous ? "Reporte Anónimo" : "Reporte con Identidad")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(DesignSystem.Colors.textPrimary)
                Spacer()
            }
        }
        .bmadCard()
    }

    // MARK: - Anonymous Toggle Section (following /inpo flow)

    private var anonymousToggleSection: some View {
        VStack(alignment: .leading, spacing: DesignSystem.Spacing.md) {
            VStack(spacing: DesignSystem.Spacing.md) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Image(systemName: "person.fill.questionmark")
                                .foregroundColor(DesignSystem.Colors.safetradeOrange)
                            Text("¿Reporte anónimo?")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(DesignSystem.Colors.textPrimary)
                        }
                        Text("Tu identidad será protegida")
                            .font(.caption)
                            .foregroundColor(DesignSystem.Colors.textSecondary)
                    }

                    Spacer()

                    Toggle("", isOn: .constant(isAnonymous))
                        .disabled(true) // Cannot change once set
                }
            }
            .bmadToggleBackground()
        }
        .bmadCard()
    }


    // MARK: - Incident Description Section (first in /inpo flow)

    private var incidentDescriptionSection: some View {
        VStack(alignment: .leading, spacing: DesignSystem.Spacing.md) {
            Text("Descripción del incidente")
                .font(.headline)
                .foregroundColor(DesignSystem.Colors.textPrimary)

            TextField("Describe detalladamente lo que ocurrió...", text: $viewModel.description, axis: .vertical)
                .lineLimit(4...8)
                .autocorrectionDisabled()
                .bmadInputField()
        }
        .bmadCard()
    }

    // MARK: - Contact Type Section (dropdown style)

    private var contactTypeSection: some View {
        VStack(alignment: .leading, spacing: DesignSystem.Spacing.md) {
            Text("Tipo de primer contacto")
                .font(.headline)
                .foregroundColor(DesignSystem.Colors.textPrimary)

            if viewModel.catalogLoading {
                HStack {
                    ProgressView()
                        .scaleEffect(0.8)
                    Text("Cargando opciones...")
                        .font(.caption)
                        .foregroundColor(DesignSystem.Colors.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color(UIColor.systemGray6))
                .cornerRadius(8)
            } else if let catalogError = viewModel.catalogError {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Error cargando opciones")
                        .font(.caption)
                        .foregroundColor(.red)
                    Text(catalogError)
                        .font(.caption2)
                        .foregroundColor(DesignSystem.Colors.textSecondary)

                    Button("Reintentar") {
                        Task {
                            await viewModel.refreshCatalogs()
                        }
                    }
                    .font(.caption)
                    .foregroundColor(.blue)
                    .padding(.top, 4)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color.red.opacity(0.1))
                .cornerRadius(8)
            } else if viewModel.attackTypeOptions.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("No hay opciones disponibles")
                        .font(.caption)
                        .foregroundColor(.orange)
                    Text("Las opciones de tipos de contacto están vacías")
                        .font(.caption2)
                        .foregroundColor(DesignSystem.Colors.textSecondary)

                    Button("Recargar") {
                        Task {
                            await viewModel.refreshCatalogs()
                        }
                    }
                    .font(.caption)
                    .foregroundColor(.blue)
                    .padding(.top, 4)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color.orange.opacity(0.1))
                .cornerRadius(8)
            } else {
                Picker("Selecciona el tipo de contacto", selection: $viewModel.selectedAttackTypeId) {
                    Text("Selecciona tipo de contacto").tag(nil as Int?)

                    ForEach(viewModel.attackTypeOptions, id: \.id) { option in
                        Text(option.displayName)
                            .tag(option.id as Int?)
                    }
                }
                .bmadPicker()

            }
        }
        .bmadCard()
    }

    // MARK: - Conditional Contact Details (like /inpo renderContactField)

    private var conditionalContactDetailsSection: some View {
        Group {
            if true { // Always show contact details for all attack types
                VStack(alignment: .leading, spacing: DesignSystem.Spacing.md) {
                    Text(getContactFieldLabel())
                        .font(.headline)
                        .foregroundColor(DesignSystem.Colors.textPrimary)

                    TextField(getContactFieldPlaceholder(), text: $viewModel.attackOrigin)
                        .bmadInputField()
                        .keyboardType(getKeyboardType())
                        .textInputAutocapitalization(getAutocapitalization())
                        .autocorrectionDisabled()

                    if viewModel.showValidationErrors, let error = viewModel.validateAttackOrigin() {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                    }

                    // Show suspicious URL field for web-based attacks
                    if shouldShowSuspiciousUrlField() {
                        VStack(alignment: .leading, spacing: DesignSystem.Spacing.sm) {
                            Text("URL Sospechosa (Opcional)")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(DesignSystem.Colors.textPrimary)

                            TextField("https://ejemplo-sospechoso.com", text: $viewModel.suspiciousUrl)
                                .bmadInputField()
                                .keyboardType(.URL)
                                .textContentType(.URL)
                                .textInputAutocapitalization(.never)
                                .autocorrectionDisabled()

                            if viewModel.showValidationErrors, let error = viewModel.validateSuspiciousUrl() {
                                Text(error)
                                    .font(.caption)
                                    .foregroundColor(.red)
                            }
                        }
                    }
                }
                .bmadCard()
            }
        }
    }

    // MARK: - Incident Details Section (date/time in same row)

    private var incidentDetailsSection: some View {
        VStack(alignment: .leading, spacing: DesignSystem.Spacing.lg) {
            Text("Detalles del Incidente")
                .font(.headline)
                .foregroundColor(DesignSystem.Colors.textPrimary)

            // Date and Time Picker (Combined)
            VStack(alignment: .leading, spacing: DesignSystem.Spacing.sm) {
                Text("Fecha y Hora del Incidente")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(DesignSystem.Colors.textPrimary)

                DatePicker("", selection: $viewModel.incidentDate, displayedComponents: [.date, .hourAndMinute])
                    .datePickerStyle(CompactDatePickerStyle())
                    .padding(DesignSystem.Spacing.md)
                    .background(Color.white)
                    .cornerRadius(8)
            }
        }
        .bmadCard()
    }

    // MARK: - Impact Section (like /inpo "¿han habido daños?")

    private var impactSection: some View {
        VStack(alignment: .leading, spacing: DesignSystem.Spacing.md) {
            VStack(spacing: DesignSystem.Spacing.md) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("¿Han habido daños?")
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(DesignSystem.Colors.textPrimary)
                        Text("Físicos, económicos o de otro tipo")
                            .font(.caption)
                            .foregroundColor(DesignSystem.Colors.textSecondary)
                    }

                    Spacer()

                    Toggle("", isOn: .init(
                        get: { hasImpactDamage() },
                        set: { hasDamages in
                            if hasDamages {
                                // Set to first non-"ninguno" impact if available
                                viewModel.selectedImpactId = getFirstDamageImpactId()
                            } else {
                                // Set to "ninguno" (no impact)
                                viewModel.selectedImpactId = getNoImpactId()
                            }
                        }
                    ))
                }
            }
            .bmadToggleBackground()

            // Show detailed impact selection if damages exist
            if hasImpactDamage() {
                VStack(alignment: .leading, spacing: DesignSystem.Spacing.sm) {
                    Text("Tipo de daño")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(DesignSystem.Colors.textPrimary)

                    VStack(spacing: DesignSystem.Spacing.sm) {
                        ForEach(getDamageImpactOptions(), id: \.id) { impact in
                            Button(action: {
                                viewModel.selectedImpactId = impact.id
                            }) {
                                HStack {
                                    Image(systemName: viewModel.selectedImpactId == impact.id ? "checkmark.circle.fill" : "circle")
                                        .foregroundColor(viewModel.selectedImpactId == impact.id ? DesignSystem.Colors.safetradeOrange : .gray)

                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(impact.displayName)
                                            .font(.subheadline)
                                            .fontWeight(.medium)
                                            .foregroundColor(viewModel.selectedImpactId == impact.id ? DesignSystem.Colors.safetradeOrange : DesignSystem.Colors.textPrimary)

                                        Text(CatalogHelpers.getImpactDescription(impact.name))
                                            .font(.caption)
                                            .foregroundColor(DesignSystem.Colors.textSecondary)
                                    }

                                    Spacer()
                                }
                                .padding(DesignSystem.Spacing.md)
                                .background(viewModel.selectedImpactId == impact.id ? DesignSystem.Colors.safetradeOrange.opacity(0.1) : Color(.systemGray6))
                            }
                        }
                    }
                }
            }
        }
        .bmadCard()
    }

    // MARK: - Additional Information Section (only show when has content)

    private var additionalInfoSection: some View {
        Group {
            // Only show this section if there's content to display
            if shouldShowMessageContent() {
                VStack(alignment: .leading, spacing: DesignSystem.Spacing.md) {
                    Text("Información Adicional")
                        .font(.headline)
                        .foregroundColor(DesignSystem.Colors.textPrimary)

                    // Message Content
                    VStack(alignment: .leading, spacing: DesignSystem.Spacing.sm) {
                        HStack {
                            Text("Contenido del Mensaje (Opcional)")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(DesignSystem.Colors.textPrimary)

                            Spacer()

                            Text("\(viewModel.messageContent.count)/5000")
                                .font(.caption)
                                .foregroundColor(viewModel.messageContent.count > 5000 ? .red : DesignSystem.Colors.textSecondary)
                        }

                        TextField("Describe el mensaje o comunicación recibida...", text: $viewModel.messageContent, axis: .vertical)
                            .lineLimit(3...6)
                            .autocorrectionDisabled()
                            .bmadInputField()
                            .onChange(of: viewModel.messageContent) { _, newValue in
                                if newValue.count > 5000 {
                                    viewModel.messageContent = String(newValue.prefix(5000))
                                }
                            }

                        if viewModel.showValidationErrors, let error = viewModel.validateMessageContent() {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }
                }
                .bmadCard()
            }
        }
    }


    // MARK: - Photo Evidence Section

    private var photoEvidenceSection: some View {
        VStack(alignment: .leading, spacing: DesignSystem.Spacing.md) {
            Text("Evidencia Fotográfica (Opcional)")
                .font(.headline)
                .foregroundColor(DesignSystem.Colors.textPrimary)

            if let photo = viewModel.selectedPhoto {
                // Show selected photo
                VStack(spacing: DesignSystem.Spacing.sm) {
                    Image(uiImage: photo)
                        .resizable()
                        .scaledToFit()
                        .frame(maxHeight: 200)
                        .cornerRadius(8)

                    HStack {
                        if viewModel.isUploadingPhoto {
                            ProgressView()
                                .scaleEffect(0.8)
                            Text("Subiendo foto...")
                                .font(.caption)
                                .foregroundColor(DesignSystem.Colors.textSecondary)
                        } else if viewModel.uploadedPhotoUrl != nil {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            Text("Foto lista para enviar")
                                .font(.caption)
                                .foregroundColor(DesignSystem.Colors.textSecondary)
                        }

                        Spacer()

                        Button(action: {
                            viewModel.removePhoto()
                        }) {
                            HStack {
                                Image(systemName: "trash")
                                Text("Eliminar")
                            }
                            .font(.caption)
                            .foregroundColor(.red)
                        }
                    }
                    .padding(.horizontal, DesignSystem.Spacing.sm)
                }
            } else {
                // Show upload buttons
                HStack(spacing: DesignSystem.Spacing.md) {
                    Button(action: {
                        imageSourceType = .camera
                        showingImagePicker = true
                    }) {
                        VStack {
                            Image(systemName: "camera.fill")
                                .font(.title2)
                            Text("Cámara")
                                .font(.caption)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                    }
                    .foregroundColor(DesignSystem.Colors.safetradeOrange)

                    Button(action: {
                        imageSourceType = .photoLibrary
                        showingImagePicker = true
                    }) {
                        VStack {
                            Image(systemName: "photo.fill")
                                .font(.title2)
                            Text("Galería")
                                .font(.caption)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                    }
                    .foregroundColor(DesignSystem.Colors.safetradeOrange)
                }
            }
        }
        .bmadCard()
        .sheet(isPresented: $showingImagePicker) {
            ImagePicker(sourceType: imageSourceType) { image in
                viewModel.selectedPhoto = image
            }
        }
    }

    // MARK: - Submit Button

    private var submitButton: some View {
        Button(action: {
            viewModel.submitReport()
        }) {
            HStack {
                Image(systemName: "paperplane.fill")
                    .font(.system(size: 16, weight: .medium))

                if viewModel.isSubmitting {
                    ProgressView()
                        .scaleEffect(0.8)
                        .foregroundColor(.white)
                }

                Text(viewModel.isSubmitting ? "Enviando..." : "Enviar Reporte")
                    .font(.headline)
                    .fontWeight(.semibold)
            }
            .bmadPrimaryButton(isDisabled: !viewModel.isFormValid || viewModel.isSubmitting)
        }
        .disabled(!viewModel.isFormValid || viewModel.isSubmitting)
    }

    // MARK: - Helper Methods

    private func getSelectedAttackTypeName() -> String {
        guard let id = viewModel.selectedAttackTypeId,
              let catalogData = viewModel.catalogData,
              let attackType = catalogData.attackTypes.first(where: { $0.id == id }) else {
            return ""
        }
        return attackType.name
    }

    private func getContactFieldLabel() -> String {
        let attackTypeName = getSelectedAttackTypeName()
        switch attackTypeName {
        case "email": return "Detalles del correo"
        case "SMS": return "Número de teléfono"
        case "whatsapp": return "Número de WhatsApp"
        case "llamada": return "Número de teléfono"
        case "redes_sociales": return "Usuario o perfil"
        default: return "Origen del ataque"
        }
    }

    private func getContactFieldPlaceholder() -> String {
        let attackTypeName = getSelectedAttackTypeName()
        switch attackTypeName {
        case "email": return "ejemplo@correo.com"
        case "SMS", "whatsapp", "llamada": return "+52 55 1234 5678"
        case "redes_sociales": return "usuario@redessociales"
        default: return "origen desconocido"
        }
    }

    private func getKeyboardType() -> UIKeyboardType {
        let attackTypeName = getSelectedAttackTypeName()
        switch attackTypeName {
        case "email": return .emailAddress
        case "SMS", "whatsapp", "llamada": return .phonePad
        default: return .default
        }
    }

    private func getAutocapitalization() -> TextInputAutocapitalization {
        let attackTypeName = getSelectedAttackTypeName()
        switch attackTypeName {
        case "email", "SMS", "whatsapp", "llamada", "redes_sociales": return .never
        default: return .sentences
        }
    }

    private func shouldShowMessageContent() -> Bool {
        let attackTypeName = getSelectedAttackTypeName()
        return ["email", "SMS", "whatsapp", "redes_sociales"].contains(attackTypeName)
    }

    private func shouldShowSuspiciousUrlField() -> Bool {
        let attackTypeName = getSelectedAttackTypeName()
        return ["email", "redes_sociales"].contains(attackTypeName)
    }

    // MARK: - Impact Helper Methods

    private func hasImpactDamage() -> Bool {
        guard let impactId = viewModel.selectedImpactId,
              let catalogData = viewModel.catalogData,
              let impact = catalogData.impacts.first(where: { $0.id == impactId }) else {
            return false
        }
        return impact.name != "ninguno"
    }

    private func getNoImpactId() -> Int? {
        guard let catalogData = viewModel.catalogData else { return nil }
        return catalogData.impacts.first(where: { $0.name == "ninguno" })?.id
    }

    private func getFirstDamageImpactId() -> Int? {
        guard let catalogData = viewModel.catalogData else { return nil }
        return catalogData.impacts.first(where: { $0.name != "ninguno" })?.id
    }

    private func getDamageImpactOptions() -> [(id: Int, name: String, displayName: String)] {
        return viewModel.impactOptions.filter { $0.name != "ninguno" }
    }

}

struct ReportSubmissionView_Previews: PreviewProvider {
    static var previews: some View {
        ReportSubmissionView()
    }
}
