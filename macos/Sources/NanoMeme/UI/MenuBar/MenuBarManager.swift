import AppKit
import SwiftUI
import NanoCore

@MainActor
public final class MenuBarManager {
    private var statusItem: NSStatusItem?
    private var panel: NSPanel?
    private var eventMonitor: Any?

    private let state: AppState
    private let popoverContent: () -> AnyView

    public var isPopoverShown: Bool { panel?.isVisible ?? false }

    public init(state: AppState, popoverContent: @escaping () -> AnyView) {
        self.state = state
        self.popoverContent = popoverContent
    }

    public func setup() {
        statusItem = NSStatusBar.system.statusItem(withLength: 30)
        statusItem?.autosaveName = "NanoMemeStatusItem"

        if let button = statusItem?.button {
            button.image = makeMenuBarIcon(generating: false)
            button.imagePosition = .imageOnly
            button.action = #selector(togglePopover)
            button.target = self
            button.toolTip = "NanoMeme"
        }

        Log.ui.info("Menu bar item configured")
    }

    /// Draw a custom 4-point star icon for the menu bar (18x18 template image)
    private func makeMenuBarIcon(generating: Bool) -> NSImage {
        let size: CGFloat = 18
        let image = NSImage(size: NSSize(width: size, height: size), flipped: false) { rect in
            let ctx = NSGraphicsContext.current!.cgContext
            let cx = rect.midX
            let cy = rect.midY

            if generating {
                // Single pulsing star when generating
                self.drawStar(in: ctx, cx: cx, cy: cy, outerR: 7, innerR: 2)
            } else {
                // Two stars (sparkles): large + small
                self.drawStar(in: ctx, cx: cx - 1, cy: cy - 1, outerR: 7, innerR: 2)
                self.drawStar(in: ctx, cx: cx + 5, cy: cy + 5, outerR: 3, innerR: 1)
            }
            return true
        }
        image.isTemplate = true
        return image
    }

    /// Draw a 4-point star at the given center
    private func drawStar(in ctx: CGContext, cx: CGFloat, cy: CGFloat, outerR: CGFloat, innerR: CGFloat) {
        let path = CGMutablePath()
        // 4-point star: top, right, bottom, left with inner points between
        path.move(to: CGPoint(x: cx, y: cy + outerR))       // top
        path.addLine(to: CGPoint(x: cx + innerR, y: cy + innerR))
        path.addLine(to: CGPoint(x: cx + outerR, y: cy))    // right
        path.addLine(to: CGPoint(x: cx + innerR, y: cy - innerR))
        path.addLine(to: CGPoint(x: cx, y: cy - outerR))    // bottom
        path.addLine(to: CGPoint(x: cx - innerR, y: cy - innerR))
        path.addLine(to: CGPoint(x: cx - outerR, y: cy))    // left
        path.addLine(to: CGPoint(x: cx - innerR, y: cy + innerR))
        path.closeSubpath()

        ctx.addPath(path)
        ctx.setFillColor(NSColor.black.cgColor) // template mode: black = opaque
        ctx.fillPath()
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

        eventMonitor = NSEvent.addGlobalMonitorForEvents(matching: [.leftMouseDown, .rightMouseDown]) { [weak self] _ in
            self?.hidePopover()
        }
    }

    public func hidePopover() {
        if let monitor = eventMonitor {
            NSEvent.removeMonitor(monitor)
            eventMonitor = nil
        }
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
        button.image = makeMenuBarIcon(generating: isGenerating)
    }
}
