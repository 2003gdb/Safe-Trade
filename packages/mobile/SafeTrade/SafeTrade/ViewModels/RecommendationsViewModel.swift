import Foundation
import Combine

@MainActor
class RecommendationsViewModel: ObservableObject {
    @Published var recommendation: Recommendation?
    @Published var securityQuote: String = ""

    private let communityService: CommunityService

    init(communityService: CommunityService = CommunityService()) {
        self.communityService = communityService
    }

    // MARK: - Public Methods

    func loadRecommendation(for attackType: String) {
        // Load hardcoded recommendation for this attack type
        recommendation = communityService.getRecommendation(for: attackType)

        // Load a random security quote
        securityQuote = communityService.getSecurityQuote()
    }
}