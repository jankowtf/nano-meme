import Foundation

public enum Resolution: String, Sendable, CaseIterable {
    case half = "0.5K"
    case one = "1K"
    case two = "2K"
    case four = "4K"
}

public enum AspectRatio: String, Sendable, CaseIterable {
    case square = "1:1"
    case landscape = "16:9"
    case portrait = "9:16"
}

public struct GeminiConfig: Sendable {
    public let modelId: String
    public let resolution: Resolution
    public let timeout: TimeInterval

    public init(
        modelId: String = "gemini-3.1-flash-image-preview",
        resolution: Resolution = .one,
        timeout: TimeInterval = 120
    ) {
        self.modelId = modelId
        self.resolution = resolution
        self.timeout = timeout
    }

    public static let `default` = GeminiConfig()

    public func apiURL(apiKey: String) -> URL {
        URL(string: "https://generativelanguage.googleapis.com/v1beta/models/\(modelId):generateContent?key=\(apiKey)")!
    }
}
