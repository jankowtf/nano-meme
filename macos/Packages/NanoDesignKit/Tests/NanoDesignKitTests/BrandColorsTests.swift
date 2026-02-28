import Testing
@testable import NanoDesignKit

@Suite("BrandColors")
struct BrandColorsTests {

    @Test("primary palette colors are accessible")
    func primaryPalette() {
        _ = Brand.cyan
        _ = Brand.teal
        _ = Brand.magenta
    }

    @Test("semantic colors are accessible")
    func semanticColors() {
        _ = Brand.active
        _ = Brand.generating
        _ = Brand.idle
        _ = Brand.success
        _ = Brand.warning
    }

    @Test("generating aliases active")
    func generatingAliasesActive() {
        // Both should be the yellow active color
        #expect(Brand.generating == Brand.active)
    }

    @Test("idle aliases cyan")
    func idleAliasesCyan() {
        #expect(Brand.idle == Brand.cyan)
    }

    @Test("text hierarchy colors are accessible")
    func textColors() {
        _ = Brand.textSecondary
        _ = Brand.textMuted
    }

    @Test("border colors are accessible")
    func borderColors() {
        _ = Brand.border
        _ = Brand.borderSubtle
    }

    @Test("AppKit NSColor variants are non-nil")
    func appKitVariants() {
        #expect(Brand.cyanNS != nil)
        #expect(Brand.activeNS != nil)
        #expect(Brand.generatingNS != nil)
        #expect(Brand.warningNS != nil)
        #expect(Brand.idleNS != nil)
    }
}
