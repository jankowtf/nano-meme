import Testing
import Foundation
@testable import NanoImageKit

@Suite("KeychainHelper")
struct KeychainHelperTests {

    private let testService = "com.kaosmaps.nanomeme.test.\(UUID().uuidString.prefix(8))"
    private let testAccount = "test-api-key"

    @Test("save and retrieve from keychain")
    func saveAndRetrieve() throws {
        let helper = KeychainHelper(service: testService, account: testAccount)
        try helper.save("sk-test-12345")
        let retrieved = helper.retrieve()
        #expect(retrieved == "sk-test-12345")
        try helper.delete()
    }

    @Test("retrieve returns nil when empty")
    func retrieveEmpty() {
        let helper = KeychainHelper(service: testService, account: testAccount)
        let result = helper.retrieve()
        #expect(result == nil)
    }

    @Test("delete removes stored value")
    func deleteRemoves() throws {
        let helper = KeychainHelper(service: testService, account: testAccount)
        try helper.save("temp-key")
        try helper.delete()
        let result = helper.retrieve()
        #expect(result == nil)
    }

    @Test("save overwrites existing value")
    func saveOverwrites() throws {
        let helper = KeychainHelper(service: testService, account: testAccount)
        try helper.save("first")
        try helper.save("second")
        let result = helper.retrieve()
        #expect(result == "second")
        try helper.delete()
    }

    @Test("resolveAPIKey checks keychain first then env")
    func resolveAPIKey() throws {
        let helper = KeychainHelper(service: testService, account: testAccount)
        // No keychain value, no env — should be nil
        let result = helper.resolveAPIKey(envVar: "NANOMEME_TEST_NONEXISTENT_KEY_\(UUID().uuidString)")
        #expect(result == nil)

        // With keychain value
        try helper.save("keychain-key")
        let keychainResult = helper.resolveAPIKey(envVar: "NANOMEME_TEST_NONEXISTENT_KEY_\(UUID().uuidString)")
        #expect(keychainResult == "keychain-key")
        try helper.delete()
    }
}
