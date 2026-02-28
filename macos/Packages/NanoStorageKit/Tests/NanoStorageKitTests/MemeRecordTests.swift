import Testing
import Foundation
@testable import NanoStorageKit

@Suite("MemeRecord")
struct MemeRecordTests {

    @Test("creates with required properties")
    func creation() {
        let record = MemeRecord(
            prompt: "A cat wearing a hat",
            overlayText: "When Friday hits",
            resolution: "1K",
            aspectRatio: "1:1"
        )
        #expect(record.prompt == "A cat wearing a hat")
        #expect(record.overlayText == "When Friday hits")
        #expect(record.resolution == "1K")
        #expect(record.aspectRatio == "1:1")
        #expect(record.isFavorite == false)
    }

    @Test("createdAt is set automatically")
    func createdAtAutoSet() {
        let before = Date()
        let record = MemeRecord(prompt: "test", overlayText: "text", resolution: "1K", aspectRatio: "1:1")
        let after = Date()
        #expect(record.createdAt >= before)
        #expect(record.createdAt <= after)
    }

    @Test("optional properties default to nil")
    func optionalDefaults() {
        let record = MemeRecord(prompt: "test", overlayText: "text", resolution: "1K", aspectRatio: "1:1")
        #expect(record.imagePath == nil)
        #expect(record.thumbnailData == nil)
    }

    @Test("displayText returns overlayText")
    func displayText() {
        let record = MemeRecord(prompt: "test", overlayText: "Make or make not", resolution: "1K", aspectRatio: "1:1")
        #expect(record.displayText == "Make or make not")
    }

    @Test("isFavorite can be toggled")
    func favoriteToggle() {
        let record = MemeRecord(prompt: "test", overlayText: "text", resolution: "1K", aspectRatio: "1:1")
        #expect(record.isFavorite == false)
        record.isFavorite = true
        #expect(record.isFavorite == true)
    }
}
