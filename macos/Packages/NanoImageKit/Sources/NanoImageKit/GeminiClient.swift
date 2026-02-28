import Foundation
import NanoCore

public enum GeminiError: Error, LocalizedError {
    case prohibitedContent(String)
    case httpError(Int)
    case noImageGenerated
    case invalidImageData
    case networkError(Error)

    public var errorDescription: String? {
        switch self {
        case .prohibitedContent(let msg): return "Content blocked: \(msg)"
        case .httpError(let code): return "HTTP error \(code)"
        case .noImageGenerated: return "No image was generated"
        case .invalidImageData: return "Invalid image data received"
        case .networkError(let err): return "Network error: \(err.localizedDescription)"
        }
    }
}

public struct GeminiResponse: Sendable {
    public let imageData: Data?
    public let textResponse: String?
}

public final class GeminiClient: Sendable {
    private let apiKey: String
    private let session: URLSession
    private let config: GeminiConfig

    public init(
        apiKey: String,
        config: GeminiConfig = .default,
        session: URLSession? = nil
    ) {
        self.apiKey = apiKey
        self.config = config

        if let session {
            self.session = session
        } else {
            let urlConfig = URLSessionConfiguration.ephemeral
            urlConfig.timeoutIntervalForRequest = config.timeout
            urlConfig.timeoutIntervalForResource = config.timeout
            self.session = URLSession(configuration: urlConfig)
        }
    }

    public func generateImage(
        prompt: String,
        resolution: Resolution? = nil
    ) async throws -> GeminiResponse {
        let actualResolution = resolution ?? config.resolution
        let request = buildRequest(prompt: prompt, resolution: actualResolution)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw GeminiError.httpError(0)
        }

        // Check for API error response
        if httpResponse.statusCode != 200 {
            if let errorResponse = try? JSONDecoder().decode(GeminiErrorResponse.self, from: data),
               errorResponse.error.message.contains("PROHIBITED_CONTENT") {
                throw GeminiError.prohibitedContent(errorResponse.error.message)
            }
            throw GeminiError.httpError(httpResponse.statusCode)
        }

        let apiResponse = try JSONDecoder().decode(GenerateContentResponse.self, from: data)
        let parsed = Self.parseResponse(apiResponse)
        if parsed.imageData == nil {
            throw GeminiError.noImageGenerated
        }
        return parsed
    }

    // MARK: - Private

    private func buildRequest(prompt: String, resolution: Resolution) -> URLRequest {
        let url = config.apiURL(apiKey: apiKey)
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = GenerateContentRequest(
            contents: [Content(parts: [Part(text: prompt)])],
            generationConfig: GenerationConfig(
                responseModalities: ["TEXT", "IMAGE"],
                imageConfig: ImageConfig(imageSize: resolution.rawValue)
            )
        )

        request.httpBody = try? JSONEncoder().encode(body)
        return request
    }

    private static func parseResponse(_ response: GenerateContentResponse) -> GeminiResponse {
        var imageData: Data?
        var textResponse: String?

        for candidate in response.candidates {
            for part in candidate.content.parts {
                if let text = part.text {
                    textResponse = text
                }
                if let inline = part.inlineData,
                   let data = Data(base64Encoded: inline.data) {
                    imageData = data
                }
            }
        }

        return GeminiResponse(imageData: imageData, textResponse: textResponse)
    }
}
