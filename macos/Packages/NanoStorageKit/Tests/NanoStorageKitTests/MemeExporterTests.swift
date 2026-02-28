import Testing
import Foundation
@testable import NanoStorageKit

@Suite("MemeExporter")
struct MemeExporterTests {

    @Test("exportAsText returns formatted text")
    func exportAsText() {
        let record = MemeRecord(
            prompt: "A wise alien",
            overlayText: "Make or make not",
            resolution: "1K",
            aspectRatio: "1:1"
        )
        let exporter = MemeExporter()
        let text = exporter.exportAsText(record)
        #expect(text.contains("A wise alien"))
        #expect(text.contains("Make or make not"))
        #expect(text.contains("1K"))
    }

    @Test("exportAsJSON returns valid JSON")
    func exportAsJSON() throws {
        let record = MemeRecord(
            prompt: "A cat",
            overlayText: "Hello World",
            resolution: "2K",
            aspectRatio: "16:9"
        )
        let exporter = MemeExporter()
        let data = try exporter.exportAsJSON(record)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]
        #expect(json["prompt"] as? String == "A cat")
        #expect(json["overlayText"] as? String == "Hello World")
        #expect(json["resolution"] as? String == "2K")
    }
}
