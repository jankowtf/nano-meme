import Foundation
import NanoCore
import NanoImageKit

@MainActor
public final class MemeCoordinator {
    public let state: AppState
    private var generationTask: Task<Void, Never>?

    public init(state: AppState) {
        self.state = state
    }

    public func generateMeme(apiKey: String) {
        guard !state.isGenerating else { return }
        guard !state.currentPrompt.isEmpty else {
            state.lastError = "Please enter a prompt"
            return
        }

        state.isGenerating = true
        state.lastError = nil
        state.generationProgress = 0.1

        let prompt = state.currentPrompt
        let overlayText = state.currentOverlayText
        let resolution = Resolution(rawValue: state.selectedResolution) ?? .one
        let aspectRatio = state.selectedAspectRatio
        let images = state.referenceImages
        let overlayConfig = state.overlayConfig

        generationTask = Task {
            do {
                let generator = ImageGenerator(apiKey: apiKey)
                state.generationProgress = 0.3

                let result = try await generator.generateMeme(
                    prompt: prompt,
                    overlayText: overlayText,
                    resolution: resolution,
                    referenceImages: images,
                    overlayConfig: overlayConfig,
                    aspectRatio: aspectRatio
                )

                state.currentMeme = result
                state.generationProgress = 1.0
                Log.app.info("Meme generated successfully")
            } catch is CancellationError {
                Log.app.info("Generation cancelled")
            } catch {
                state.lastError = error.localizedDescription
                Log.app.error("Generation failed: \(error.localizedDescription)")
            }

            state.isGenerating = false
        }
    }

    public func cancelGeneration() {
        generationTask?.cancel()
        generationTask = nil
        state.isGenerating = false
        state.generationProgress = 0
    }
}
