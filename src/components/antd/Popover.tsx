import React from "react";
import Tooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap_white.css";

import styles from "./Popover.module.css";

interface Props {
  overlayClassName?: string;
  content: React.ReactNode;
  children?: React.ReactElement;
}

export default function Popover(props: Props) {
  return (
    <Tooltip
      overlayClassName={(props.overlayClassName ?? "") + " " + styles.antpop}
      placement="top"
      trigger="hover"
      overlay={props.content}
      transitionName="rc-tooltip-zoom"
    >
      {props.children}
    </Tooltip>
  );
}
