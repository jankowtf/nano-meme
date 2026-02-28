import Testing
@testable import NanoStorageKit

@Suite("SettingsStore")
struct SettingsStoreTests {

    @Test("shared instance exists")
    func sharedInstance() {
        let store = SettingsStore.shared
        #expect(store != nil)
    }

    @Test("default resolution is 1K")
    func defaultResolution() {
        let store = SettingsStore.shared
        #expect(store.defaultResolution == "1K")
    }

    @Test("default aspect ratio is 1:1")
    func defaultAspectRatio() {
        let store = SettingsStore.shared
        #expect(store.defaultAspectRatio == "1:1")
    }

    @Test("showInDock defaults to false")
    func showInDockDefault() {
        let store = SettingsStore.shared
        #expect(store.showInDock == false)
    }

    @Test("launchAtLogin defaults to false")
    func launchAtLoginDefault() {
        let store = SettingsStore.shared
        #expect(store.launchAtLogin == false)
    }

    @Test("autoOverlayText defaults to true")
    func autoOverlayTextDefault() {
        let store = SettingsStore.shared
        #expect(store.autoOverlayText == true)
    }
}
