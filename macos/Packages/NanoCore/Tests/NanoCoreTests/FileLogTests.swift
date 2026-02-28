import Testing
@testable import NanoCore

@Suite("FileLog")
struct FileLogTests {

    @Test("shared instance is accessible")
    func sharedInstance() {
        let log = FileLog.shared
        #expect(log != nil)
    }

    @Test("level raw values are correct")
    func levelRawValues() {
        #expect(FileLog.Level.debug.rawValue == "DEBUG")
        #expect(FileLog.Level.info.rawValue == "INFO")
        #expect(FileLog.Level.warning.rawValue == "WARN")
        #expect(FileLog.Level.error.rawValue == "ERROR")
        #expect(FileLog.Level.fatal.rawValue == "FATAL")
    }

    @Test("write does not crash")
    func writeNoCrash() {
        FileLog.shared.write(category: "test", level: .info, message: "Test write")
    }

    @Test("write handles empty message")
    func writeEmptyMessage() {
        FileLog.shared.write(category: "test", level: .debug, message: "")
    }

    @Test("write handles special characters")
    func writeSpecialChars() {
        FileLog.shared.write(category: "test", level: .info, message: "Unicode: 日本語 🎨 émojis")
    }
}
