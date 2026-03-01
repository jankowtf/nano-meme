import React, { forwardRef } from "react";
import { View, Image, type ImageStyle } from "react-native";
import Svg, { Text as SvgText, TSpan } from "react-native-svg";
import { computeOverlayStyle, type OverlayStyleConfig } from "./overlayStyle";

export type { OverlayStyleConfig } from "./overlayStyle";
export { computeOverlayStyle } from "./overlayStyle";

export interface MemeCompositeProps {
  baseImageUri: string;
  overlayText: string;
  overlayConfig: OverlayStyleConfig;
  imageWidth: number;
  imageHeight: number;
  style?: ImageStyle;
  onImageLoad?: () => void;
}

/**
 * Renders base image with SVG text overlay.
 * White fill + black stroke = classic meme style (matches macOS CoreGraphics renderer).
 */
export const MemeComposite = forwardRef<View, MemeCompositeProps>(
  ({ baseImageUri, overlayText, overlayConfig, imageWidth, imageHeight, style, onImageLoad }, ref) => {
    const computed = computeOverlayStyle(overlayConfig, imageWidth, imageHeight, overlayText);

    return (
      <View ref={ref} style={[{ width: imageWidth, height: imageHeight }, style]} collapsable={false}>
        <Image
          source={{ uri: baseImageUri }}
          style={{ width: imageWidth, height: imageHeight, position: "absolute" }}
          resizeMode="cover"
          onLoad={onImageLoad}
        />
        {computed.lines.length > 0 && (
          <Svg
            width={imageWidth}
            height={imageHeight}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            {/* Black stroke */}
            <SvgText
              x={computed.x}
              y={computed.y}
              textAnchor={computed.textAnchor}
              fontSize={computed.fontSize}
              fontWeight="bold"
              fontFamily="Impact"
              fill="black"
              stroke="black"
              strokeWidth={computed.fontSize * 0.08}
            >
              {computed.lines.map((line, i) => (
                <TSpan x={computed.x} dy={i === 0 ? 0 : computed.lineHeight} key={i}>
                  {line}
                </TSpan>
              ))}
            </SvgText>
            {/* White fill on top */}
            <SvgText
              x={computed.x}
              y={computed.y}
              textAnchor={computed.textAnchor}
              fontSize={computed.fontSize}
              fontWeight="bold"
              fontFamily="Impact"
              fill="white"
            >
              {computed.lines.map((line, i) => (
                <TSpan x={computed.x} dy={i === 0 ? 0 : computed.lineHeight} key={i}>
                  {line}
                </TSpan>
              ))}
            </SvgText>
          </Svg>
        )}
      </View>
    );
  },
);

MemeComposite.displayName = "MemeComposite";
