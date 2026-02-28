import Testing
@testable import NanoMemeLib

@Suite("SettingsWindowController")
struct SettingsWindowControllerTests {

    @Test("shared instance exists")
    @MainActor
    func sharedInstance() {
        let controller = SettingsWindowController.shared
        #expect(controller != nil)
    }

    @Test("configure accepts state and callback")
    @MainActor
    func configure() {
        let state = AppState()
        SettingsWindowController.shared.configure(state: state) { _ in }
        // No crash = success
    }
}
