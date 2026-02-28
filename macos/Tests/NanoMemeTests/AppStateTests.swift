import Testing
@testable import NanoMemeLib

@Suite("AppState")
struct AppStateTests {

    @Test("initial state is idle")
    func initialState() {
        let state = AppState()
        #expect(state.isGenerating == false)
        #expect(state.currentPrompt == "")
        #expect(state.currentOverlayText == "")
        #expect(state.lastError == nil)
        #expect(state.isAPIKeyConfigured == false)
    }

    @Test("clearError resets lastError")
    func clearError() {
        let state = AppState()
        state.lastError = "Something went wrong"
        state.clearError()
        #expect(state.lastError == nil)
    }

    @Test("generationProgress defaults to 0")
    func generationProgress() {
        let state = AppState()
        #expect(state.generationProgress == 0)
    }

    @Test("selectedResolution defaults to 1K")
    func defaultResolution() {
        let state = AppState()
        #expect(state.selectedResolution == "1K")
    }
}
