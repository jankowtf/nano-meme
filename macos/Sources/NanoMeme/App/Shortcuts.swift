import KeyboardShortcuts

extension KeyboardShortcuts.Name {
    public static let togglePopover = Self("togglePopover", default: .init(.m, modifiers: [.control, .option]))
    public static let generateMeme = Self("generateMeme", default: .init(.g, modifiers: [.control, .option]))
}
