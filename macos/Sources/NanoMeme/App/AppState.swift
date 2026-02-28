import SwiftUI
import AppKit
import NanoImageKit

@Observable
public final class AppState {
    // Generation
    public var isGenerating = false
    public var generationProgress: Double = 0
    public var currentMeme: MemeResult?

    // Input
    public var currentPrompt = ""
    public var currentOverlayText = ""
    public var selectedResolution = "1K"

    // API
    public var isAPIKeyConfigured = false

    // UI
    public var lastError: String?

    public init() {}

    public func clearError() {
        lastError = nil
    }
}
