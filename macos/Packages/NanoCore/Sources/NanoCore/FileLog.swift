import Foundation

/// File-based logger for crash investigation and diagnostics.
/// Writes to ~/Library/Logs/{AppName}/{appname}.log, rotated at 5 MB.
public final class FileLog: @unchecked Sendable {
    public enum Level: String {
        case debug = "DEBUG"
        case info = "INFO"
        case warning = "WARN"
        case error = "ERROR"
        case fatal = "FATAL"
    }

    public static let shared = FileLog()

    private let queue = DispatchQueue(label: "com.kaosmaps.nano.filelog")
    private var logDir: URL
    private var logFile: URL
    private let maxFileSize: UInt64 = 5 * 1024 * 1024 // 5 MB
    private var fileHandle: FileHandle?
    private let dateFormatter: DateFormatter

    private init() {
        let config = NanoConfig.current
        self.logDir = config.logDirectory
        self.logFile = config.logDirectory.appendingPathComponent(
            "\(config.appName.lowercased()).log"
        )

        self.dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss.SSS"
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")

        setupLogDirectory()
        openLogFile()
        writeHeader()
    }

    public func reconfigure() {
        let config = NanoConfig.current
        fileHandle?.closeFile()
        self.logDir = config.logDirectory
        self.logFile = config.logDirectory.appendingPathComponent(
            "\(config.appName.lowercased()).log"
        )
        setupLogDirectory()
        openLogFile()
        writeHeader()
    }

    deinit {
        fileHandle?.closeFile()
    }

    public func write(category: String, level: Level, message: String) {
        let timestamp = dateFormatter.string(from: Date())
        let line = "[\(timestamp)] [\(level.rawValue)] [\(category)] \(message)\n"

        queue.async { [weak self] in
            guard let self, let data = line.data(using: .utf8) else { return }
            self.rotateIfNeeded()
            self.fileHandle?.write(data)
            self.fileHandle?.synchronizeFile()
        }
    }

    public func installCrashHandlers() {
        let signals: [Int32] = [SIGABRT, SIGSEGV, SIGBUS, SIGFPE, SIGILL, SIGTRAP]
        for sig in signals {
            signal(sig) { signalNumber in
                let msg = "[CRASH] Received signal \(signalNumber) (\(FileLog.signalName(signalNumber)))\n"
                if let data = msg.data(using: .utf8) {
                    FileLog.shared.fileHandle?.write(data)
                    FileLog.shared.fileHandle?.synchronizeFile()
                }
                Foundation.signal(signalNumber, SIG_DFL)
                raise(signalNumber)
            }
        }
    }

    // MARK: - Private

    private func setupLogDirectory() {
        try? FileManager.default.createDirectory(at: logDir, withIntermediateDirectories: true)
    }

    private func openLogFile() {
        if !FileManager.default.fileExists(atPath: logFile.path) {
            FileManager.default.createFile(atPath: logFile.path, contents: nil)
        }
        fileHandle = FileHandle(forWritingAtPath: logFile.path)
        fileHandle?.seekToEndOfFile()
    }

    private func writeHeader() {
        let config = NanoConfig.current
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "dev"
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "0"
        let header = """
        \n═══ \(config.appName) \(version) (build \(build)) — Session started \(dateFormatter.string(from: Date())) ═══
        System: \(ProcessInfo.processInfo.operatingSystemVersionString), RAM: \(ProcessInfo.processInfo.physicalMemory / (1024*1024*1024)) GB
        PID: \(ProcessInfo.processInfo.processIdentifier)\n\n
        """
        if let data = header.data(using: .utf8) {
            fileHandle?.write(data)
            fileHandle?.synchronizeFile()
        }
    }

    private func rotateIfNeeded() {
        guard let attrs = try? FileManager.default.attributesOfItem(atPath: logFile.path),
              let size = attrs[.size] as? UInt64,
              size > maxFileSize else { return }

        fileHandle?.closeFile()
        let rotated = logDir.appendingPathComponent(
            "\(NanoConfig.current.appName.lowercased()).log.1"
        )
        try? FileManager.default.removeItem(at: rotated)
        try? FileManager.default.moveItem(at: logFile, to: rotated)
        FileManager.default.createFile(atPath: logFile.path, contents: nil)
        fileHandle = FileHandle(forWritingAtPath: logFile.path)
    }

    private static func signalName(_ sig: Int32) -> String {
        switch sig {
        case SIGABRT: return "SIGABRT"
        case SIGSEGV: return "SIGSEGV"
        case SIGBUS: return "SIGBUS"
        case SIGFPE: return "SIGFPE"
        case SIGILL: return "SIGILL"
        case SIGTRAP: return "SIGTRAP"
        default: return "SIG\(sig)"
        }
    }
}
