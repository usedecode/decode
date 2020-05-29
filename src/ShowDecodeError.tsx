import React from "react";
import { DecodeError } from "errors";

interface Props {
  error: DecodeError;
}

export default function ShowDecodeError({ error }: Props) {
  let renderContext = () => {
    let { context } = error;
    if (context) {
      return (
        <div style={styles.context}>
          <div>Status</div>
          <code>{context.response.status}</code>
          <div>Body</div>
          <pre>
            <code>
              {context.json ? JSON.stringify(context.json) : "<not parsed>"}
            </code>
          </pre>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.h1}>Decode encountered an error.</h1>
        <p>{error.message}</p>
        {renderContext()}
      </div>
    </div>
  );
}

let styles = {
  container: {
    margin: "40px auto",
    maxWidth: "600px",
  },
  box: {
    boxShadow: "4px 4px 0 3px rgba(0,0,0,0.30)",
    color: "#333",
    backgroundColor: "#fff1f0",
    padding: "15px",
    fontFamily: "Montserrat, Helvetica, sans-serif",
    fontSize: "16px",
  },
  h1: {
    fontSize: "1.5em",
  },
  context: {
    gridTemplateColumns: "auto 1fr",
    fontFamily: "monospace",
  },
};
