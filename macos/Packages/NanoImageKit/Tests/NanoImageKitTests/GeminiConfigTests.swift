import Testing
@testable import NanoImageKit

@Suite("GeminiConfig")
struct GeminiConfigTests {

    @Test("Resolution raw values match API expectations")
    func resolutionRawValues() {
        #expect(Resolution.half.rawValue == "0.5K")
        #expect(Resolution.one.rawValue == "1K")
        #expect(Resolution.two.rawValue == "2K")
        #expect(Resolution.four.rawValue == "4K")
    }

    @Test("AspectRatio raw values are correct")
    func aspectRatioRawValues() {
        #expect(AspectRatio.square.rawValue == "1:1")
        #expect(AspectRatio.landscape.rawValue == "16:9")
        #expect(AspectRatio.portrait.rawValue == "9:16")
    }

    @Test("default model ID is gemini-3.1-flash-image-preview")
    func defaultModelId() {
        let config = GeminiConfig.default
        #expect(config.modelId == "gemini-3.1-flash-image-preview")
    }

    @Test("default resolution is 1K")
    func defaultResolution() {
        let config = GeminiConfig.default
        #expect(config.resolution == .one)
    }

    @Test("default timeout is 120 seconds")
    func defaultTimeout() {
        let config = GeminiConfig.default
        #expect(config.timeout == 120)
    }

    @Test("custom config overrides")
    func customConfig() {
        let config = GeminiConfig(
            modelId: "custom-model",
            resolution: .four,
            timeout: 60
        )
        #expect(config.modelId == "custom-model")
        #expect(config.resolution == .four)
        #expect(config.timeout == 60)
    }

    @Test("API endpoint URL construction")
    func apiEndpoint() {
        let config = GeminiConfig.default
        let url = config.apiURL(apiKey: "test-key")
        #expect(url.absoluteString.contains("gemini-3.1-flash-image-preview"))
        #expect(url.absoluteString.contains("key=test-key"))
        #expect(url.absoluteString.contains("generateContent"))
    }
}
