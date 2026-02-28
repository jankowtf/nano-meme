import Testing
import Foundation
@testable import NanoImageKit

// Mock URLProtocol for testing — uses per-request URL matching
final class MockURLProtocol: URLProtocol, @unchecked Sendable {
    nonisolated(unsafe) static var requestHandler: ((URLRequest) throws -> (Data, HTTPURLResponse))?

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        do {
            guard let handler = MockURLProtocol.requestHandler else {
                client?.urlProtocolDidFinishLoading(self)
                return
            }
            let (data, response) = try handler(request)
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
        } catch {
            client?.urlProtocol(self, didFailWithError: error)
        }
        client?.urlProtocolDidFinishLoading(self)
    }

    override func stopLoading() {}
}

@Suite("GeminiClient", .serialized)
struct GeminiClientTests {

    private func makeTestSession() -> URLSession {
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [MockURLProtocol.self]
        return URLSession(configuration: config)
    }

    @Test("successful image generation returns image data")
    func successfulGeneration() async throws {
        let pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

        let responseJSON = """
        {
            "candidates": [{
                "content": {
                    "parts": [
                        {"text": "Here is your image"},
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

        let client = GeminiClient(apiKey: "test-key", session: makeTestSession())
        let result = try await client.generateImage(prompt: "A cat")
        #expect(result.imageData != nil)
        #expect(result.textResponse != nil)
    }

    @Test("handles PROHIBITED_CONTENT error")
    func prohibitedContentError() async throws {
        let errorJSON = """
        {
            "error": {
                "code": 400,
                "message": "PROHIBITED_CONTENT: Image generation blocked",
                "status": "INVALID_ARGUMENT"
            }
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { request in
            let url = request.url!
            let response = HTTPURLResponse(url: url, statusCode: 400, httpVersion: nil, headerFields: nil)!
            return (errorJSON, response)
        }

        let client = GeminiClient(apiKey: "test-key", session: makeTestSession())
        do {
            _ = try await client.generateImage(prompt: "test")
            #expect(Bool(false), "Should have thrown")
        } catch let error as GeminiError {
            if case .prohibitedContent = error {
                // Expected
            } else {
                #expect(Bool(false), "Wrong error type: \(error)")
            }
        }
    }

    @Test("handles HTTP error status")
    func httpError() async throws {
        MockURLProtocol.requestHandler = { request in
            let url = request.url!
            let response = HTTPURLResponse(url: url, statusCode: 500, httpVersion: nil, headerFields: nil)!
            return ("{}".data(using: .utf8)!, response)
        }

        let client = GeminiClient(apiKey: "test-key", session: makeTestSession())
        do {
            _ = try await client.generateImage(prompt: "test")
            #expect(Bool(false), "Should have thrown")
        } catch let error as GeminiError {
            if case .httpError(let code) = error {
                #expect(code == 500)
            } else {
                #expect(Bool(false), "Wrong error type: \(error)")
            }
        }
    }

    @Test("handles no image in response")
    func noImageInResponse() async throws {
        let responseJSON = """
        {
            "candidates": [{
                "content": {
                    "parts": [{"text": "I cannot generate that image"}]
                }
            }]
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { request in
            let url = request.url!
            let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (responseJSON, response)
        }

        let client = GeminiClient(apiKey: "test-key", session: makeTestSession())
        do {
            _ = try await client.generateImage(prompt: "test")
            #expect(Bool(false), "Should have thrown")
        } catch let error as GeminiError {
            if case .noImageGenerated = error {
                // Expected
            } else {
                #expect(Bool(false), "Wrong error type: \(error)")
            }
        }
    }
}
