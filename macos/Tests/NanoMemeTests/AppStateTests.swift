import Testing
import Foundation
@testable import NanoMemeLib
import NanoImageKit

@Suite("AppState")
struct AppStateTests {

    @Test("initial state is idle")
    func initialState() {
        let state = AppState()
        #expect(state.isGenerating == false)
        #expect(state.currentPrompt == "")
        #expect(state.currentOverlayText == "")
        #expect(state.lastError == nil)
        #expect(state.isAPIKeyConfigured == false)
    }

    @Test("clearError resets lastError")
    func clearError() {
        let state = AppState()
        state.lastError = "Something went wrong"
        state.clearError()
        #expect(state.lastError == nil)
    }

    @Test("generationProgress defaults to 0")
    func generationProgress() {
        let state = AppState()
        #expect(state.generationProgress == 0)
    }

    @Test("selectedResolution defaults to 1K")
    func defaultResolution() {
        let state = AppState()
        #expect(state.selectedResolution == "1K")
    }

    @Test("selectedAspectRatio defaults to square")
    func defaultAspectRatio() {
        let state = AppState()
        #expect(state.selectedAspectRatio == .square)
    }

    @Test("starts with empty reference images")
    func emptyReferenceImages() {
        let state = AppState()
        #expect(state.referenceImages.isEmpty)
    }

    @Test("addImage assigns sequential ids")
    func addImageSequentialIds() {
        let state = AppState()
        let testData = Data("test".utf8)
        state.addImage(data: testData, mimeType: "image/png")
        state.addImage(data: testData, mimeType: "image/jpeg")
        #expect(state.referenceImages.count == 2)
        #expect(state.referenceImages[0].id == "img-1")
        #expect(state.referenceImages[1].id == "img-2")
    }

    @Test("removeImage re-indexes remaining images")
    func removeImageReindexes() {
        let state = AppState()
        let data1 = Data("one".utf8)
        let data2 = Data("two".utf8)
        let data3 = Data("three".utf8)
        state.addImage(data: data1, mimeType: "image/png")
        state.addImage(data: data2, mimeType: "image/png")
        state.addImage(data: data3, mimeType: "image/png")

        state.removeImage(id: "img-2")
        #expect(state.referenceImages.count == 2)
        #expect(state.referenceImages[0].id == "img-1")
        #expect(state.referenceImages[0].data == data1)
        #expect(state.referenceImages[1].id == "img-2")
        #expect(state.referenceImages[1].data == data3)
    }

    @Test("clearImages removes all")
    func clearImages() {
        let state = AppState()
        state.addImage(data: Data("test".utf8), mimeType: "image/png")
        state.clearImages()
        #expect(state.referenceImages.isEmpty)
    }

    @Test("enforces max 14 reference images")
    func maxReferenceImages() {
        let state = AppState()
        for i in 0..<16 {
            state.addImage(data: Data("img\(i)".utf8), mimeType: "image/png")
        }
        #expect(state.referenceImages.count == 14)
    }
}
