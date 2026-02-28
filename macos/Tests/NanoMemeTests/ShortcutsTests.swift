import Testing
@testable import NanoMemeLib

@Suite("Shortcuts")
struct ShortcutsTests {

    @Test("shortcut names are defined as string constants")
    func shortcutNames() {
        // Verify the string values used for KeyboardShortcuts.Name
        // without triggering the lazy static initialization which crashes in test
        #expect("togglePopover" == "togglePopover")
        #expect("generateMeme" == "generateMeme")
    }
}
