import Foundation

/// Configurable application identity and defaults.
/// Each app in the Nano ecosystem provides its own configuration.
///
/// Usage:
///   NanoConfig.current = .nanoMeme  // at app launch
///
public struct NanoConfig: Sendable {
    public let appName: String
    public let bundleId: String
    public let logDirectory: URL
    public let dataCacheDirectory: URL

    public init(
        appName: String,
        bundleId: String,
        logDirectory: URL? = nil,
        dataCacheDirectory: URL? = nil
    ) {
        self.appName = appName
        self.bundleId = bundleId

        let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        self.logDirectory = logDirectory ?? FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent("Library/Logs/\(appName)", isDirectory: true)
        self.dataCacheDirectory = dataCacheDirectory ?? support
            .appendingPathComponent("\(appName)/Data", isDirectory: true)
    }

    // MARK: - Global Current Config

    /// The active configuration. Set at app launch before using any Nano kit.
    public static var current: NanoConfig = .nanoMeme

    // MARK: - Presets

    public static let nanoMeme = NanoConfig(
        appName: "NanoMeme",
        bundleId: "com.kaosmaps.nanomeme"
    )
}
