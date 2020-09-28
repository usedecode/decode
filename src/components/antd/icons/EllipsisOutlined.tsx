import React from "react";
import BaseIcon, { DefaultIconProps } from "./BaseIcon";

export default function EllipsisOutlined(props: DefaultIconProps) {
  return (
    <BaseIcon spanProps={props} svgProps={{ viewBox: "64 64 896 896" }}>
      <path d="M176 511a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0z" />
    </BaseIcon>
  );
}