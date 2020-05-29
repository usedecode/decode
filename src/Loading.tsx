import React from "react";

let inlineStyle = `.decode-loader {
  animation: decode-loader-spin infinite 1s linear;
}
@keyframes decode-loader-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;

export default function Loading({ msg }: { msg: string }) {
  return (
    <div style={styles.container}>
      <style dangerouslySetInnerHTML={{ __html: inlineStyle }}></style>
      <div style={styles.box}>
        <h1 style={styles.h1}>
          <LoadingSpinner /> {msg}
        </h1>
      </div>
    </div>
  );
}

let LoadingSpinner = () => (
  <svg
    viewBox="0 0 1024 1024"
    focusable="false"
    data-icon="loading"
    className="decode-loader"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
  </svg>
);

let styles = {
  container: {
    margin: "40px auto",
    maxWidth: "600px",
  },
  box: {
    boxShadow: "4px 4px 0 3px rgba(0,0,0,0.30)",
    color: "#333",
    backgroundColor: "#ffffff",
    padding: "15px",
    fontFamily: "Montserrat, Helvetica, sans-serif",
    fontSize: "16px",
  },
  h1: {
    fontSize: "1.3em",
  },
};
