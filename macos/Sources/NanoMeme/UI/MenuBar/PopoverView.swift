import SwiftUI
import UniformTypeIdentifiers
import NanoDesignKit
import NanoImageKit

public struct PopoverView: View {
    @Bindable var state: AppState
    let onGenerate: () -> Void
    let onCancel: () -> Void
    let onSettings: () -> Void
    let onQuit: () -> Void

    public init(
        state: AppState,
        onGenerate: @escaping () -> Void,
        onCancel: @escaping () -> Void,
        onSettings: @escaping () -> Void,
        onQuit: @escaping () -> Void
    ) {
        self.state = state
        self.onGenerate = onGenerate
        self.onCancel = onCancel
        self.onSettings = onSettings
        self.onQuit = onQuit
    }

    public var body: some View {
        VStack(spacing: 0) {
            // Header
            headerView
                .padding(.horizontal, 16)
                .padding(.top, 12)

            Divider()
                .background(Brand.border)
                .padding(.vertical, 8)

            // Content based on state
            if state.currentMeme != nil && !state.isGenerating {
                resultView
            } else if state.isGenerating {
                generatingView
            } else {
                idleView
            }

            Spacer(minLength: 0)

            // Error display
            if let error = state.lastError {
                errorBanner(error)
            }

            // Footer
            footerView
                .padding(.horizontal, 16)
                .padding(.bottom, 12)
        }
        .frame(width: 380, height: 520)
        .background(Color(red: 10/255, green: 10/255, blue: 15/255))
    }

    // MARK: - Header

    private var headerView: some View {
        HStack {
            Text("NanoMeme")
                .font(.system(size: 16, weight: .bold))
                .foregroundStyle(Brand.cyan)

            Spacer()

            if !state.isAPIKeyConfigured {
                Label("No API Key", systemImage: "key.slash")
                    .font(.caption)
                    .foregroundStyle(Brand.warning)
            }
        }
    }

    // MARK: - Idle

    private var idleView: some View {
        VStack(spacing: 12) {
            // Prompt input
            VStack(alignment: .leading, spacing: 4) {
                Text("Prompt")
                    .font(.caption)
                    .foregroundStyle(Brand.textSecondary)

                TextEditor(text: $state.currentPrompt)
                    .font(.system(size: 13))
                    .frame(height: 100)
                    .scrollContentBackground(.hidden)
                    .background(Color(red: 18/255, green: 18/255, blue: 26/255))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Brand.border, lineWidth: 1)
                    )
            }

            // Overlay text
            VStack(alignment: .leading, spacing: 4) {
                Text("Text Overlay")
                    .font(.caption)
                    .foregroundStyle(Brand.textSecondary)

                TextField("Make or make not. There is no buy", text: $state.currentOverlayText)
                    .textFieldStyle(.plain)
                    .font(.system(size: 13))
                    .padding(8)
                    .background(Color(red: 18/255, green: 18/255, blue: 26/255))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Brand.border, lineWidth: 1)
                    )

                // Position presets
                HStack(spacing: 6) {
                    Text("Position")
                        .font(.system(size: 10))
                        .foregroundStyle(Brand.textMuted)

                    ForEach(TextOverlayPosition.allCases, id: \.rawValue) { pos in
                        Button(action: {
                            state.overlayConfig.position = pos
                            state.overlayConfig.offsetX = 0
                            state.overlayConfig.offsetY = 0
                        }) {
                            Text(pos.rawValue.capitalized)
                                .font(.system(size: 10, weight: .medium))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(
                                    state.overlayConfig.position == pos
                                        ? Brand.cyan.opacity(0.2)
                                        : Color.clear
                                )
                                .foregroundStyle(
                                    state.overlayConfig.position == pos
                                        ? Brand.cyan
                                        : Brand.textMuted
                                )
                                .clipShape(RoundedRectangle(cornerRadius: 4))
                        }
                        .buttonStyle(.plain)
                    }
                }

                // Font size slider
                HStack(spacing: 6) {
                    Text("Size")
                        .font(.system(size: 10))
                        .foregroundStyle(Brand.textMuted)
                        .frame(width: 44, alignment: .leading)

                    Text("A")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(Brand.textMuted)

                    Slider(value: $state.overlayConfig.fontScale, in: 0.5...2.0, step: 0.1)
                        .tint(Brand.cyan)

                    Text("A")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(Brand.textMuted)
                }
            }

            // Reference images
            VStack(alignment: .leading, spacing: 4) {
                Text("Reference Images (\(state.referenceImages.count)/\(ReferenceImage.maxCount))")
                    .font(.caption)
                    .foregroundStyle(Brand.textSecondary)

                if !state.referenceImages.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(state.referenceImages, id: \.id) { img in
                                ZStack(alignment: .topTrailing) {
                                    if let nsImage = NSImage(data: img.data) {
                                        Image(nsImage: nsImage)
                                            .resizable()
                                            .aspectRatio(contentMode: .fill)
                                            .frame(width: 56, height: 56)
                                            .clipShape(RoundedRectangle(cornerRadius: 6))
                                    }

                                    // Badge
                                    Text("@\(img.id)")
                                        .font(.system(size: 8, weight: .semibold, design: .monospaced))
                                        .foregroundStyle(Brand.cyan)
                                        .padding(.horizontal, 3)
                                        .padding(.vertical, 1)
                                        .background(.black.opacity(0.7))
                                        .clipShape(RoundedRectangle(cornerRadius: 3))
                                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)

                                    // Remove button
                                    Button(action: { state.removeImage(id: img.id) }) {
                                        Image(systemName: "xmark.circle.fill")
                                            .font(.system(size: 14))
                                            .foregroundStyle(.white, .red)
                                    }
                                    .buttonStyle(.plain)
                                    .offset(x: 4, y: -4)
                                }
                                .frame(width: 56, height: 56)
                            }
                        }
                    }
                }

                Button(action: pickImages) {
                    Text("Add Images")
                        .font(.caption)
                        .foregroundStyle(Brand.cyan)
                }
                .buttonStyle(.plain)
                .disabled(state.referenceImages.count >= ReferenceImage.maxCount)
            }

            // Resolution picker
            HStack {
                Text("Resolution")
                    .font(.caption)
                    .foregroundStyle(Brand.textSecondary)
                Spacer()
                Picker("", selection: $state.selectedResolution) {
                    Text("0.5K").tag("0.5K")
                    Text("1K").tag("1K")
                    Text("2K").tag("2K")
                    Text("4K").tag("4K")
                }
                .pickerStyle(.segmented)
                .frame(width: 200)
            }

            // Aspect ratio picker
            HStack {
                Text("Aspect Ratio")
                    .font(.caption)
                    .foregroundStyle(Brand.textSecondary)
                Spacer()
                Picker("", selection: $state.selectedAspectRatio) {
                    ForEach(AspectRatio.allCases, id: \.self) { ratio in
                        Text(ratio.rawValue).tag(ratio)
                    }
                }
                .pickerStyle(.segmented)
                .frame(width: 200)
            }

            // Generate button
            Button(action: onGenerate) {
                HStack {
                    Image(systemName: "sparkles")
                    Text("Generate Meme")
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(
                    state.isAPIKeyConfigured
                        ? Brand.cyan
                        : Color.gray.opacity(0.3)
                )
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .shadow(color: Brand.cyan.opacity(0.3), radius: 8)
            }
            .buttonStyle(.plain)
            .disabled(!state.isAPIKeyConfigured || state.currentPrompt.isEmpty)
        }
        .padding(.horizontal, 16)
    }

    // MARK: - Generating

    private var generatingView: some View {
        VStack(spacing: 16) {
            Spacer()

            ProgressView()
                .scaleEffect(1.5)
                .tint(Brand.cyan)

            Text("Generating your meme...")
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(Brand.textSecondary)

            ProgressView(value: state.generationProgress)
                .tint(Brand.cyan)
                .padding(.horizontal, 40)

            Button("Cancel") { onCancel() }
                .buttonStyle(.plain)
                .foregroundStyle(Brand.warning)

            Spacer()
        }
        .padding(.horizontal, 16)
    }

    // MARK: - Result

    private var resultView: some View {
        VStack(spacing: 12) {
            if let meme = state.currentMeme {
                Image(nsImage: meme.image)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(maxHeight: 280)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Brand.cyan.opacity(0.4), lineWidth: 1)
                    )
                    .shadow(color: Brand.cyan.opacity(0.2), radius: 12)

                HStack(spacing: 12) {
                    Button(action: { copyToClipboard(meme.image) }) {
                        Label("Copy", systemImage: "doc.on.doc")
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(Brand.cyan)

                    Button(action: { saveToFile(meme) }) {
                        Label("Save", systemImage: "square.and.arrow.down")
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(Brand.cyan)

                    Button(action: { state.currentMeme = nil }) {
                        Label("New", systemImage: "plus.circle")
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(Brand.teal)
                }
            }
        }
        .padding(.horizontal, 16)
    }

    // MARK: - Error

    private func errorBanner(_ message: String) -> some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(Brand.warning)
            Text(message)
                .font(.caption)
                .foregroundStyle(Brand.warning)
                .lineLimit(2)
        }
        .padding(8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Brand.warning.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 6))
        .padding(.horizontal, 16)
        .onTapGesture { state.clearError() }
    }

    // MARK: - Footer

    private var footerView: some View {
        HStack {
            Button(action: onSettings) {
                Image(systemName: "gear")
                    .foregroundStyle(Brand.textMuted)
            }
            .buttonStyle(.plain)

            Spacer()

            Text("Ctrl+Opt+M")
                .font(.system(size: 10, design: .monospaced))
                .foregroundStyle(Brand.textMuted)

            Spacer()

            Button(action: onQuit) {
                Image(systemName: "power")
                    .foregroundStyle(Brand.textMuted)
            }
            .buttonStyle(.plain)
        }
    }

    // MARK: - Actions

    private func copyToClipboard(_ image: NSImage) {
        let pb = NSPasteboard.general
        pb.clearContents()
        pb.writeObjects([image])
    }

    private func pickImages() {
        let panel = NSOpenPanel()
        panel.allowsMultipleSelection = true
        panel.canChooseDirectories = false
        panel.allowedContentTypes = [.png, .jpeg, .webP, .heic]
        panel.begin { response in
            if response == .OK {
                for url in panel.urls {
                    guard state.referenceImages.count < ReferenceImage.maxCount,
                          let data = try? Data(contentsOf: url) else { continue }
                    let mimeType = url.pathExtension.lowercased() == "png" ? "image/png" : "image/jpeg"
                    state.addImage(data: data, mimeType: mimeType)
                }
            }
        }
    }

    private func saveToFile(_ meme: MemeResult) {
        let panel = NSSavePanel()
        panel.allowedContentTypes = [.png]
        panel.nameFieldStringValue = "meme.png"
        panel.begin { response in
            if response == .OK, let url = panel.url {
                if let tiff = meme.image.tiffRepresentation,
                   let bitmap = NSBitmapImageRep(data: tiff),
                   let png = bitmap.representation(using: .png, properties: [:]) {
                    try? png.write(to: url)
                }
            }
        }
    }
}
