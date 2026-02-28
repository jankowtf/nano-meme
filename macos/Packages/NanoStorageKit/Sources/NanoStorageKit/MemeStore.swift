import SwiftData
import Foundation
import NanoCore

@MainActor
public final class MemeStore {
    public let modelContainer: ModelContainer

    public init() throws {
        let schema = Schema([MemeRecord.self])
        let config = ModelConfiguration(
            schema: schema,
            url: NanoConfig.current.dataCacheDirectory.appendingPathComponent("memes.store")
        )
        self.modelContainer = try ModelContainer(for: schema, configurations: [config])
    }

    public func save(_ record: MemeRecord) throws {
        let context = modelContainer.mainContext
        context.insert(record)
        try context.save()
        Log.storage.info("Saved meme: \(record.prompt.prefix(30))...")
    }

    public func fetchAll(
        favoritesOnly: Bool = false,
        searchText: String? = nil
    ) throws -> [MemeRecord] {
        var descriptor = FetchDescriptor<MemeRecord>(
            sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
        )

        if favoritesOnly {
            descriptor.predicate = #Predicate<MemeRecord> { $0.isFavorite == true }
        }

        return try modelContainer.mainContext.fetch(descriptor)
    }

    public func delete(_ record: MemeRecord) throws {
        modelContainer.mainContext.delete(record)
        try modelContainer.mainContext.save()
    }

    public func toggleFavorite(_ record: MemeRecord) throws {
        record.isFavorite.toggle()
        try modelContainer.mainContext.save()
    }
}
