import SwiftUI
import AppKit

/// KaosMaps brand colors — shared across all Nano apps.
public enum Brand {
    // Primary palette
    public static let cyan = Color(red: 6/255, green: 182/255, blue: 212/255)
    public static let teal = Color(red: 20/255, green: 184/255, blue: 166/255)
    public static let magenta = Color(red: 236/255, green: 72/255, blue: 153/255)

    // Semantic
    public static let active = Color(red: 250/255, green: 204/255, blue: 21/255)
    public static let generating = active
    public static let idle = cyan
    public static let success = Color(red: 34/255, green: 197/255, blue: 94/255)
    public static let warning = Color(red: 249/255, green: 115/255, blue: 22/255)

    // Text hierarchy (dark theme)
    public static let textSecondary = Color(red: 204/255, green: 251/255, blue: 241/255, opacity: 0.55)
    public static let textMuted = Color(red: 153/255, green: 246/255, blue: 228/255, opacity: 0.28)

    // Borders
    public static let border = Color(red: 6/255, green: 182/255, blue: 212/255, opacity: 0.12)
    public static let borderSubtle = Color(red: 6/255, green: 182/255, blue: 212/255, opacity: 0.06)

    // AppKit NSColor variants
    public static let cyanNS = NSColor(red: 6/255, green: 182/255, blue: 212/255, alpha: 1)
    public static let activeNS = NSColor(red: 250/255, green: 204/255, blue: 21/255, alpha: 1)
    public static let generatingNS = activeNS
    public static let warningNS = NSColor(red: 249/255, green: 115/255, blue: 22/255, alpha: 1)
    public static let idleNS = cyanNS
}
