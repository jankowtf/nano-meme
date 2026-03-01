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
    public var selectedAspectRatio: AspectRatio = .square
    public var referenceImages: [ReferenceImage] = []
    public var overlayConfig = OverlayConfig.default

    // API
    public var isAPIKeyConfigured = false

    // UI
    public var lastError: String?

    public init() {}

    public func clearError() {
        lastError = nil
    }

    public func addImage(data: Data, mimeType: String) {
        guard referenceImages.count < ReferenceImage.maxCount else { return }
        let id = "img-\(referenceImages.count + 1)"
        referenceImages.append(ReferenceImage(id: id, data: data, mimeType: mimeType))
    }

    public func removeImage(id: String) {
        referenceImages.removeAll { $0.id == id }
        // Re-index
        referenceImages = referenceImages.enumerated().map { index, img in
            ReferenceImage(id: "img-\(index + 1)", data: img.data, mimeType: img.mimeType)
        }
    }

    public func clearImages() {
        referenceImages.removeAll()
    }
}
