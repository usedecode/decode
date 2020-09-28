import React, { ReactElement } from "react";

import styles from "./FetchingMask.module.css";

import { LoadingOutlined } from "./antd/icons";

interface Props {
  fetching?: boolean;
}

export default function FetchingMask({ fetching }: Props): ReactElement {
  if (fetching) {
    return (
      <div className={`${styles.fetchingmask} ${styles.fetching}`}>
        <div className={styles.spinner}>
          <LoadingOutlined />
        </div>
      </div>
    );
  }
  return <div className={`${styles.fetchingmask}`}></div>;
}
