import React from "react";

import styles from "./Button.module.css";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  colorType?: "primary" | "ghost" | "dashed" | "link" | "text" | "default";
}

export default function Button(props: React.PropsWithChildren<Props>) {
  let classApendix = props.colorType ? "-" + props.colorType : "";

  return (
    <button
      {...props}
      className={
        styles["ant-btn" + classApendix] + " " + (props.className ?? "")
      }
    >
      {props.children}
    </button>
  );
}
