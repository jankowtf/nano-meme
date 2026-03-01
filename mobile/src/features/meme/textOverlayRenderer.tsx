import React, { forwardRef } from "react";
import { View, Image, type ImageStyle } from "react-native";
import Svg, { Text as SvgText } from "react-native-svg";
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
    const computed = computeOverlayStyle(overlayConfig, imageWidth, imageHeight);
    const upperText = overlayText.toUpperCase();

    return (
      <View ref={ref} style={[{ width: imageWidth, height: imageHeight }, style]} collapsable={false}>
        <Image
          source={{ uri: baseImageUri }}
          style={{ width: imageWidth, height: imageHeight, position: "absolute" }}
          resizeMode="cover"
          onLoad={onImageLoad}
        />
        {overlayText.length > 0 && (
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
              {upperText}
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
              {upperText}
            </SvgText>
          </Svg>
        )}
      </View>
    );
  },
);

MemeComposite.displayName = "MemeComposite";
