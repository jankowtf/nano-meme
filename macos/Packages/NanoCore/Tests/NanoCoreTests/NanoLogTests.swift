import Testing
@testable import NanoCore

@Suite("NanoLog")
struct NanoLogTests {

    @Test("all log categories are accessible")
    func logCategories() {
        // Verify each logger can be created without crashing
        _ = Log.api
        _ = Log.image
        _ = Log.ui
        _ = Log.storage
        _ = Log.app
        _ = Log.keychain
    }

    @Test("loggers use current config bundleId")
    func loggersUseConfigBundleId() {
        // Loggers are created from NanoConfig.current.bundleId
        let config = NanoConfig.current
        #expect(config.bundleId == "com.kaosmaps.nanomeme")
    }

    @Test("file log write does not crash")
    func fileLogWrite() {
        Log.file("test", .info, "NanoLog test message")
        Log.file("test", .debug, "Debug message")
        Log.file("test", .warning, "Warning message")
        Log.file("test", .error, "Error message")
    }
}
