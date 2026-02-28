import Testing
import Foundation
import AppKit
@testable import NanoImageKit

@Suite("TextOverlayRenderer")
struct TextOverlayRendererTests {

    @Test("renders text onto image without crashing")
    func renderText() {
        // Create a simple 200x200 test image
        let image = NSImage(size: NSSize(width: 200, height: 200))
        image.lockFocus()
        NSColor.blue.setFill()
        NSBezierPath.fill(NSRect(x: 0, y: 0, width: 200, height: 200))
        image.unlockFocus()

        let renderer = TextOverlayRenderer()
        let result = renderer.render(
            text: "Test overlay",
            onto: image,
            position: .bottom
        )
        #expect(result.size.width == 200)
        #expect(result.size.height == 200)
    }

    @Test("handles empty text gracefully")
    func emptyText() {
        let image = NSImage(size: NSSize(width: 100, height: 100))
        image.lockFocus()
        NSColor.red.setFill()
        NSBezierPath.fill(NSRect(x: 0, y: 0, width: 100, height: 100))
        image.unlockFocus()

        let renderer = TextOverlayRenderer()
        let result = renderer.render(text: "", onto: image, position: .bottom)
        #expect(result.size.width == 100)
    }

    @Test("supports different positions")
    func positions() {
        let image = NSImage(size: NSSize(width: 100, height: 100))
        image.lockFocus()
        NSColor.gray.setFill()
        NSBezierPath.fill(NSRect(x: 0, y: 0, width: 100, height: 100))
        image.unlockFocus()

        let renderer = TextOverlayRenderer()
        for position in TextOverlayPosition.allCases {
            let result = renderer.render(text: "Test", onto: image, position: position)
            #expect(result.size.width == 100)
        }
    }

    @Test("handles long text without crashing")
    func longText() {
        let image = NSImage(size: NSSize(width: 400, height: 400))
        image.lockFocus()
        NSColor.green.setFill()
        NSBezierPath.fill(NSRect(x: 0, y: 0, width: 400, height: 400))
        image.unlockFocus()

        let longText = String(repeating: "Make or make not. There is no buy. ", count: 10)
        let renderer = TextOverlayRenderer()
        let result = renderer.render(text: longText, onto: image, position: .bottom)
        #expect(result.size.width == 400)
    }
}
