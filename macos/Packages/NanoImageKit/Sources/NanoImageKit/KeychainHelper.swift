import Foundation
import Security
import NanoCore

public struct KeychainHelper: Sendable {
    public let service: String
    public let account: String

    public init(
        service: String = "com.kaosmaps.nanomeme",
        account: String = "gemini-api-key"
    ) {
        self.service = service
        self.account = account
    }

    public func save(_ value: String) throws {
        guard let data = value.data(using: .utf8) else { return }

        // Delete existing first
        try? delete()

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data,
        ]

        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status)
        }
        Log.keychain.info("API key saved to Keychain")
    }

    public func retrieve() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let value = String(data: data, encoding: .utf8) else {
            return nil
        }
        return value
    }

    public func delete() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]

        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.deleteFailed(status)
        }
    }

    /// Resolve API key: Keychain first, then environment variable fallback.
    public func resolveAPIKey(envVar: String = "GEMINI_API_KEY") -> String? {
        if let keychainKey = retrieve() {
            return keychainKey
        }
        return ProcessInfo.processInfo.environment[envVar]
    }
}

public enum KeychainError: Error, LocalizedError {
    case saveFailed(OSStatus)
    case deleteFailed(OSStatus)

    public var errorDescription: String? {
        switch self {
        case .saveFailed(let status): return "Keychain save failed (status: \(status))"
        case .deleteFailed(let status): return "Keychain delete failed (status: \(status))"
        }
    }
}
