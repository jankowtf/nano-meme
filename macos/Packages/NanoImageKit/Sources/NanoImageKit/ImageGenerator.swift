import AppKit
import Foundation
import NanoCore

/// Result of a meme generation operation.
public struct MemeResult: Sendable {
    public let image: NSImage
    public let rawImageData: Data
    public let prompt: String
    public let overlayText: String
    public let resolution: Resolution

    public init(
        image: NSImage,
        rawImageData: Data,
        prompt: String,
        overlayText: String,
        resolution: Resolution
    ) {
        self.image = image
        self.rawImageData = rawImageData
        self.prompt = prompt
        self.overlayText = overlayText
        self.resolution = resolution
    }
}

/// Orchestrates Gemini API image generation + text overlay rendering.
public final class ImageGenerator: Sendable {
    private let client: GeminiClient
    private let renderer: TextOverlayRenderer
    private let config: GeminiConfig

    public init(
        apiKey: String,
        config: GeminiConfig = .default,
        session: URLSession? = nil
    ) {
        self.client = GeminiClient(apiKey: apiKey, config: config, session: session)
        self.renderer = TextOverlayRenderer()
        self.config = config
    }

    /// Generate a meme: API call for base image, then overlay text.
    public func generateMeme(
        prompt: String,
        overlayText: String,
        resolution: Resolution? = nil,
        referenceImages: [ReferenceImage] = [],
        overlayConfig: OverlayConfig = .default,
        aspectRatio: AspectRatio? = nil
    ) async throws -> MemeResult {
        let actualResolution = resolution ?? config.resolution

        Log.api.info("Generating image: \(prompt.prefix(50))...")

        let response = try await client.generateImage(prompt: prompt, resolution: actualResolution, referenceImages: referenceImages, aspectRatio: aspectRatio)

        guard let imageData = response.imageData else {
            throw GeminiError.noImageGenerated
        }

        guard let baseImage = NSImage(data: imageData) else {
            throw GeminiError.invalidImageData
        }

        Log.image.info("Base image received (\(Int(baseImage.size.width))x\(Int(baseImage.size.height)))")

        // Apply text overlay
        let finalImage: NSImage
        if overlayText.isEmpty {
            finalImage = baseImage
        } else {
            finalImage = renderer.render(text: overlayText, onto: baseImage, config: overlayConfig)
            Log.image.info("Text overlay applied: \(overlayText.prefix(30))...")
        }

        return MemeResult(
            image: finalImage,
            rawImageData: imageData,
            prompt: prompt,
            overlayText: overlayText,
            resolution: actualResolution
        )
    }
}
