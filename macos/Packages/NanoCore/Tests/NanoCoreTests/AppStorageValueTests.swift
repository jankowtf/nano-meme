import Testing
import Foundation
@testable import NanoCore

@Suite("AppStorageValue")
struct AppStorageValueTests {

    private let testPrefix = "test_\(UUID().uuidString.prefix(8))_"

    @Test("returns default when key unset")
    func defaultValue() {
        let key = "test_\(UUID().uuidString)_unset"
        @AppStorageValue(key, defaultValue: true)
        var flag: Bool
        #expect(flag == true)
    }

    @Test("persists Bool value")
    func persistsBool() {
        let key = "test_\(UUID().uuidString)_bool"
        @AppStorageValue(key, defaultValue: false)
        var flag: Bool
        flag = true
        #expect(flag == true)
        UserDefaults.standard.removeObject(forKey: key)
    }

    @Test("persists String value")
    func persistsString() {
        let key = "test_\(UUID().uuidString)_string"
        @AppStorageValue(key, defaultValue: "default")
        var text: String
        text = "hello"
        #expect(text == "hello")
        UserDefaults.standard.removeObject(forKey: key)
    }

    @Test("persists Double value")
    func persistsDouble() {
        let key = "test_\(UUID().uuidString)_double"
        @AppStorageValue(key, defaultValue: 0.0)
        var value: Double
        value = 42.5
        #expect(value == 42.5)
        UserDefaults.standard.removeObject(forKey: key)
    }

    @Test("type mismatch returns default")
    func typeMismatch() {
        let key = "test_\(UUID().uuidString)_mismatch"
        UserDefaults.standard.set("not_a_bool", forKey: key)
        @AppStorageValue(key, defaultValue: true)
        var flag: Bool
        #expect(flag == true)
        UserDefaults.standard.removeObject(forKey: key)
    }
}
