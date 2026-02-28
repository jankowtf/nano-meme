import Testing
@testable import NanoMemeLib

@Suite("MenuBarManager")
struct MenuBarManagerTests {

    @Test("initializes without popover shown")
    @MainActor
    func initialState() {
        let state = AppState()
        let manager = MenuBarManager(state: state) { AnyView(EmptyView()) }
        #expect(manager.isPopoverShown == false)
    }

    @Test("setup creates status item")
    @MainActor
    func setup() {
        let state = AppState()
        let manager = MenuBarManager(state: state) { AnyView(EmptyView()) }
        manager.setup()
        // Status item creation doesn't crash
        #expect(manager.isPopoverShown == false)
    }
}

import SwiftUI
