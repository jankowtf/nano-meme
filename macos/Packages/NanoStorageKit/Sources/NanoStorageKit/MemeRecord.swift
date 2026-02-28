import SwiftData
import Foundation

@Model
public final class MemeRecord {
    public var prompt: String
    public var overlayText: String
    public var resolution: String
    public var aspectRatio: String
    public var imagePath: String?
    public var thumbnailData: Data?
    public var createdAt: Date
    public var isFavorite: Bool

    public init(
        prompt: String,
        overlayText: String,
        resolution: String,
        aspectRatio: String,
        imagePath: String? = nil,
        thumbnailData: Data? = nil,
        isFavorite: Bool = false
    ) {
        self.prompt = prompt
        self.overlayText = overlayText
        self.resolution = resolution
        self.aspectRatio = aspectRatio
        self.imagePath = imagePath
        self.thumbnailData = thumbnailData
        self.createdAt = Date()
        self.isFavorite = isFavorite
    }

    public var displayText: String {
        overlayText
    }
}
