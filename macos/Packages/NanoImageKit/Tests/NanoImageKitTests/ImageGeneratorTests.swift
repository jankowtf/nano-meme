import Testing
import Foundation
import AppKit
@testable import NanoImageKit

@Suite("ImageGenerator", .serialized)
struct ImageGeneratorTests {

    @Test("MemeResult stores all properties")
    func memeResultProperties() {
        let image = NSImage(size: NSSize(width: 100, height: 100))
        let result = MemeResult(
            image: image,
            rawImageData: Data([0x89, 0x50]),
            prompt: "test prompt",
            overlayText: "test overlay",
            resolution: .one
        )
        #expect(result.prompt == "test prompt")
        #expect(result.overlayText == "test overlay")
        #expect(result.resolution == .one)
        #expect(result.image.size.width == 100)
    }

    @Test("generateMeme orchestrates API call and overlay")
    func generateMemeOrchestration() async throws {
        let pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

        let responseJSON = """
        {
            "candidates": [{
                "content": {
                    "parts": [
                        {"text": "Generated"},
                        {"inlineData": {"mimeType": "image/png", "data": "\(pngBase64)"}}
                    ]
                }
            }]
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { request in
            let url = request.url!
            let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (responseJSON, response)
        }

        let sessionConfig = URLSessionConfiguration.ephemeral
        sessionConfig.protocolClasses = [MockURLProtocol.self]
        let session = URLSession(configuration: sessionConfig)

        let generator = ImageGenerator(
            apiKey: "test-key",
            session: session
        )

        let result = try await generator.generateMeme(
            prompt: "A cat",
            overlayText: "Hello World"
        )
        #expect(result.prompt == "A cat")
        #expect(result.overlayText == "Hello World")
        #expect(result.image.size.width > 0)
    }
}
