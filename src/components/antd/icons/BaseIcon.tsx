import React from "react";

import styles from "./BaseIcon.module.css";

export type DefaultIconProps = React.HTMLAttributes<HTMLSpanElement>;

interface Props {
  svgProps: React.SVGProps<SVGSVGElement>;
  spanProps: React.HTMLAttributes<HTMLSpanElement>;
}

export default function BaseIcon({
  svgProps,
  spanProps,
  children,
}: React.PropsWithChildren<Props>) {
  return (
    <span
      {...spanProps}
      role="img"
      className={styles.anticon + " " + spanProps.className ?? ""}
    >
      <svg
        {...svgProps}
        viewBox={svgProps.viewBox}
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        height="1em"
        width="1em"
        fill="currentColor"
      >
        {children}
      </svg>
    </span>
  );
}
