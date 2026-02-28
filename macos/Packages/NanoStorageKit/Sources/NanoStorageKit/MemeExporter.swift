import Foundation

public struct MemeExporter {
    public init() {}

    public func exportAsText(_ record: MemeRecord) -> String {
        let date = ISO8601DateFormatter().string(from: record.createdAt)
        return """
        Meme — \(date)
        Prompt: \(record.prompt)
        Overlay: \(record.overlayText)
        Resolution: \(record.resolution)
        """
    }

    public func exportAsJSON(_ record: MemeRecord) throws -> Data {
        let dict: [String: Any] = [
            "prompt": record.prompt,
            "overlayText": record.overlayText,
            "resolution": record.resolution,
            "aspectRatio": record.aspectRatio,
            "createdAt": ISO8601DateFormatter().string(from: record.createdAt),
            "isFavorite": record.isFavorite,
        ]
        return try JSONSerialization.data(withJSONObject: dict, options: [.prettyPrinted, .sortedKeys])
    }
}
