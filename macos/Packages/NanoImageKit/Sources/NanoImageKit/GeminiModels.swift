import Foundation

// MARK: - Request Types

public struct GenerateContentRequest: Codable, Sendable {
    public let contents: [Content]
    public let generationConfig: GenerationConfig

    public init(contents: [Content], generationConfig: GenerationConfig) {
        self.contents = contents
        self.generationConfig = generationConfig
    }

    enum CodingKeys: String, CodingKey {
        case contents
        case generationConfig = "generationConfig"
    }
}

public struct Content: Codable, Sendable {
    public let parts: [Part]

    public init(parts: [Part]) {
        self.parts = parts
    }
}

public struct Part: Codable, Sendable {
    public let text: String?
    public let inlineData: InlineData?

    public init(text: String? = nil, inlineData: InlineData? = nil) {
        self.text = text
        self.inlineData = inlineData
    }
}

public struct InlineData: Codable, Sendable {
    public let mimeType: String
    public let data: String

    public init(mimeType: String, data: String) {
        self.mimeType = mimeType
        self.data = data
    }
}

public struct GenerationConfig: Codable, Sendable {
    public let responseModalities: [String]
    public let imageConfig: ImageConfig?

    public init(responseModalities: [String], imageConfig: ImageConfig? = nil) {
        self.responseModalities = responseModalities
        self.imageConfig = imageConfig
    }
}

public struct ImageConfig: Codable, Sendable {
    public let imageSize: String

    public init(imageSize: String) {
        self.imageSize = imageSize
    }
}

// MARK: - Response Types

public struct GenerateContentResponse: Codable, Sendable {
    public let candidates: [Candidate]
}

public struct Candidate: Codable, Sendable {
    public let content: Content
}

// MARK: - Error Response

public struct GeminiErrorResponse: Codable, Sendable {
    public let error: GeminiErrorDetail
}

public struct GeminiErrorDetail: Codable, Sendable {
    public let code: Int
    public let message: String
    public let status: String
}
