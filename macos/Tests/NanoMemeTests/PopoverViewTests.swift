import Testing
import SwiftUI
@testable import NanoMemeLib

@Suite("PopoverView")
struct PopoverViewTests {

    @Test("PopoverView creates without crash")
    @MainActor
    func creation() {
        let state = AppState()
        let view = PopoverView(
            state: state,
            onGenerate: {},
            onCancel: {},
            onSettings: {},
            onQuit: {}
        )
        #expect(view.body != nil)
    }

    @Test("PopoverView shows idle state by default")
    @MainActor
    func idleState() {
        let state = AppState()
        #expect(state.isGenerating == false)
        #expect(state.currentMeme == nil)
    }
}
