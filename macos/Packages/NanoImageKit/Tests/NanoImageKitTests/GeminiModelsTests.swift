import Testing
import Foundation
@testable import NanoImageKit

@Suite("GeminiModels")
struct GeminiModelsTests {

    @Test("GenerateContentRequest encodes correctly")
    func requestEncoding() throws {
        let request = GenerateContentRequest(
            contents: [
                Content(parts: [Part(text: "A cat wearing a hat")])
            ],
            generationConfig: GenerationConfig(
                responseModalities: ["TEXT", "IMAGE"],
                imageConfig: ImageConfig(imageSize: "1K")
            )
        )

        let data = try JSONEncoder().encode(request)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]
        let contents = json["contents"] as! [[String: Any]]
        let parts = contents[0]["parts"] as! [[String: Any]]
        #expect(parts[0]["text"] as? String == "A cat wearing a hat")
    }

    @Test("GenerateContentResponse decodes text part")
    func responseDecodesText() throws {
        let json = """
        {
            "candidates": [{
                "content": {
                    "parts": [{"text": "Here is your image"}]
                }
            }]
        }
        """.data(using: .utf8)!

        let response = try JSONDecoder().decode(GenerateContentResponse.self, from: json)
        #expect(response.candidates.first?.content.parts.first?.text == "Here is your image")
    }

    @Test("GenerateContentResponse decodes inline data part")
    func responseDecodesInlineData() throws {
        let json = """
        {
            "candidates": [{
                "content": {
                    "parts": [{
                        "inlineData": {
                            "mimeType": "image/png",
                            "data": "iVBORw0KGgo="
                        }
                    }]
                }
            }]
        }
        """.data(using: .utf8)!

        let response = try JSONDecoder().decode(GenerateContentResponse.self, from: json)
        let part = response.candidates.first?.content.parts.first
        #expect(part?.inlineData?.mimeType == "image/png")
        #expect(part?.inlineData?.data == "iVBORw0KGgo=")
    }

    @Test("Part can have text or inlineData but not both")
    func partMutualExclusivity() throws {
        let textJson = """
        {"text": "hello"}
        """.data(using: .utf8)!
        let textPart = try JSONDecoder().decode(Part.self, from: textJson)
        #expect(textPart.text == "hello")
        #expect(textPart.inlineData == nil)

        let imageJson = """
        {"inlineData": {"mimeType": "image/png", "data": "abc"}}
        """.data(using: .utf8)!
        let imagePart = try JSONDecoder().decode(Part.self, from: imageJson)
        #expect(imagePart.text == nil)
        #expect(imagePart.inlineData?.data == "abc")
    }

    @Test("GenerationConfig encodes with snake_case keys")
    func generationConfigEncoding() throws {
        let config = GenerationConfig(
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: ImageConfig(imageSize: "2K")
        )
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(config)
        let json = String(data: data, encoding: .utf8)!
        #expect(json.contains("response_modalities"))
        #expect(json.contains("image_config"))
        #expect(json.contains("image_size"))
    }
}
