import AppKit
import Foundation

public enum TextOverlayPosition: String, CaseIterable, Sendable {
    case top
    case center
    case bottom
}

/// Configuration for text overlay rendering.
public struct OverlayConfig: Sendable, Equatable {
    public var position: TextOverlayPosition
    public var fontScale: CGFloat // 0.5 - 2.0 multiplier on default font size
    public var offsetX: CGFloat   // normalized -1.0 to 1.0 (fraction of image width)
    public var offsetY: CGFloat   // normalized -1.0 to 1.0 (fraction of image height)

    public static let `default` = OverlayConfig(
        position: .bottom,
        fontScale: 1.0,
        offsetX: 0,
        offsetY: 0
    )

    public init(position: TextOverlayPosition, fontScale: CGFloat = 1.0, offsetX: CGFloat = 0, offsetY: CGFloat = 0) {
        self.position = position
        self.fontScale = fontScale
        self.offsetX = offsetX
        self.offsetY = offsetY
    }
}

public struct TextOverlayRenderer: Sendable {

    public init() {}

    /// Renders text overlay onto an image using Core Graphics.
    /// Uses white fill with black stroke (classic meme style).
    public func render(
        text: String,
        onto image: NSImage,
        position: TextOverlayPosition,
        fontSize: CGFloat? = nil
    ) -> NSImage {
        render(text: text, onto: image, config: OverlayConfig(position: position), fontSize: fontSize)
    }

    /// Renders text overlay with full configuration control.
    public func render(
        text: String,
        onto image: NSImage,
        config: OverlayConfig,
        fontSize: CGFloat? = nil
    ) -> NSImage {
        guard !text.isEmpty else { return image }

        let size = image.size
        let result = NSImage(size: size)

        result.lockFocus()
        image.draw(in: NSRect(origin: .zero, size: size))

        let baseFontSize = fontSize ?? max(size.width / 14, 24)
        let calculatedFontSize = baseFontSize * config.fontScale

        // Impact font with fallback to Helvetica-Bold
        let font = NSFont(name: "Impact", size: calculatedFontSize)
            ?? NSFont.boldSystemFont(ofSize: calculatedFontSize)

        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.alignment = .center
        paragraphStyle.lineBreakMode = .byWordWrapping

        // White fill + black stroke (classic meme text)
        let strokeAttributes: [NSAttributedString.Key: Any] = [
            .font: font,
            .foregroundColor: NSColor.black,
            .strokeColor: NSColor.black,
            .strokeWidth: -4.0,
            .paragraphStyle: paragraphStyle,
        ]

        let fillAttributes: [NSAttributedString.Key: Any] = [
            .font: font,
            .foregroundColor: NSColor.white,
            .paragraphStyle: paragraphStyle,
        ]

        let upperText = text.uppercased()
        let margin: CGFloat = size.width * 0.05
        let maxWidth = size.width - margin * 2

        let textRect = (upperText as NSString).boundingRect(
            with: NSSize(width: maxWidth, height: .greatestFiniteMagnitude),
            options: [.usesLineFragmentOrigin, .usesFontLeading],
            attributes: fillAttributes
        )

        var drawRect: NSRect
        switch config.position {
        case .top:
            drawRect = NSRect(
                x: margin,
                y: size.height - textRect.height - margin * 2,
                width: maxWidth,
                height: textRect.height + margin
            )
        case .center:
            drawRect = NSRect(
                x: margin,
                y: (size.height - textRect.height) / 2,
                width: maxWidth,
                height: textRect.height + margin
            )
        case .bottom:
            drawRect = NSRect(
                x: margin,
                y: margin * 2,
                width: maxWidth,
                height: textRect.height + margin
            )
        }

        // Apply custom offsets
        drawRect.origin.x += config.offsetX * size.width
        drawRect.origin.y += config.offsetY * size.height

        // Draw stroke first, then fill
        (upperText as NSString).draw(in: drawRect, withAttributes: strokeAttributes)
        (upperText as NSString).draw(in: drawRect, withAttributes: fillAttributes)

        result.unlockFocus()
        return result
    }
}
