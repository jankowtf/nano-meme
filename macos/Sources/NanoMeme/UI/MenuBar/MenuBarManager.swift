import AppKit
import SwiftUI
import NanoCore

@MainActor
public final class MenuBarManager {
    private var statusItem: NSStatusItem?
    private var panel: NSPanel?

    private let state: AppState
    private let popoverContent: () -> AnyView

    public var isPopoverShown: Bool { panel?.isVisible ?? false }

    public init(state: AppState, popoverContent: @escaping () -> AnyView) {
        self.state = state
        self.popoverContent = popoverContent
    }

    public func setup() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)

        if let button = statusItem?.button {
            if let image = NSImage(systemSymbolName: "sparkles", accessibilityDescription: "NanoMeme") {
                image.isTemplate = true
                button.image = image
                button.imagePosition = .imageOnly
            } else {
                button.title = "✦"
            }
            button.action = #selector(togglePopover)
            button.target = self
            button.toolTip = "NanoMeme"
        }

        Log.ui.info("Menu bar item configured")
    }

    @objc private func togglePopover() {
        if isPopoverShown {
            hidePopover()
        } else {
            showPopover()
        }
    }

    public func showPopover() {
        guard let button = statusItem?.button else { return }

        if panel == nil {
            createPanel()
        }

        guard let panel else { return }

        let buttonRect = button.window?.convertToScreen(button.frame) ?? .zero
        let panelWidth: CGFloat = 380
        let panelHeight: CGFloat = 520
        let x = buttonRect.midX - panelWidth / 2
        let y = buttonRect.minY - panelHeight - 4

        panel.setFrame(NSRect(x: x, y: y, width: panelWidth, height: panelHeight), display: true)
        panel.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    public func hidePopover() {
        panel?.orderOut(nil)
    }

    private func createPanel() {
        let panel = NSPanel(
            contentRect: NSRect(x: 0, y: 0, width: 380, height: 520),
            styleMask: [.nonactivatingPanel, .titled, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        panel.isFloatingPanel = true
        panel.level = .floating
        panel.titleVisibility = .hidden
        panel.titlebarAppearsTransparent = true
        panel.isMovableByWindowBackground = true
        panel.backgroundColor = NSColor(red: 10/255, green: 10/255, blue: 15/255, alpha: 0.95)
        panel.hasShadow = true

        let hostingView = NSHostingView(rootView: popoverContent())
        panel.contentView = hostingView

        self.panel = panel
    }

    public func updateIcon(isGenerating: Bool) {
        guard let button = statusItem?.button else { return }
        let symbolName = isGenerating ? "sparkle" : "sparkles"
        let description = isGenerating ? "Generating" : "NanoMeme"
        if let image = NSImage(systemSymbolName: symbolName, accessibilityDescription: description) {
            image.isTemplate = true
            button.image = image
        }
    }
}
