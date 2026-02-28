import Testing
import Foundation
@testable import NanoStorageKit

@Suite("MemeStore")
struct MemeStoreTests {

    @Test("MemeStore initializes without throwing")
    @MainActor
    func initialization() throws {
        let store = try MemeStore()
        #expect(store.modelContainer != nil)
    }

    @Test("save and fetchAll round-trip")
    @MainActor
    func saveAndFetch() throws {
        let store = try MemeStore()
        let record = MemeRecord(
            prompt: "test prompt",
            overlayText: "test overlay",
            resolution: "1K",
            aspectRatio: "1:1"
        )
        try store.save(record)
        let results = try store.fetchAll()
        #expect(results.contains(where: { $0.prompt == "test prompt" }))
    }

    @Test("toggleFavorite flips isFavorite")
    @MainActor
    func toggleFavorite() throws {
        let store = try MemeStore()
        let record = MemeRecord(
            prompt: "fav test",
            overlayText: "text",
            resolution: "1K",
            aspectRatio: "1:1"
        )
        try store.save(record)
        #expect(record.isFavorite == false)
        try store.toggleFavorite(record)
        #expect(record.isFavorite == true)
    }
}
