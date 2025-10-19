import SwiftUI

struct ContentView: View {
    @ObservedObject private var authService = AuthenticationService.shared

    var body: some View {
        Group {
            if authService.isAuthenticated {
                AuthenticatedMainView()
            } else {
                WelcomeView()
            }
        }
        .onAppear {
            authService.checkAuthenticationStatus()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
