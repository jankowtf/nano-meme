import Foundation
import os

/// Centralized log categories for the NanoMeme ecosystem.
/// Uses os.Logger (unified log system) with configurable subsystem from NanoConfig.
///
/// Usage:
///   Log.api.info("Gemini request sent")
///   Log.image.info("Text overlay rendered")
///   Log.file("api", .info, "Response: 200 OK")
///
public enum Log {
    public static var api: Logger { Logger(subsystem: NanoConfig.current.bundleId, category: "api") }
    public static var image: Logger { Logger(subsystem: NanoConfig.current.bundleId, category: "image") }
    public static var ui: Logger { Logger(subsystem: NanoConfig.current.bundleId, category: "ui") }
    public static var storage: Logger { Logger(subsystem: NanoConfig.current.bundleId, category: "storage") }
    public static var app: Logger { Logger(subsystem: NanoConfig.current.bundleId, category: "app") }
    public static var keychain: Logger { Logger(subsystem: NanoConfig.current.bundleId, category: "keychain") }

    /// Write directly to file log (for critical breadcrumbs that must survive a crash).
    public static func file(_ category: String, _ level: FileLog.Level, _ message: String) {
        FileLog.shared.write(category: category, level: level, message: message)
    }
}
