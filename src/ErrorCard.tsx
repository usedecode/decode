import React, { useState } from "react";
import { DecodeError } from "errors";

interface Props {
  error: DecodeError;
}

export default function ErrorCard({ error }: Props) {
  let [showDetails, setShowDetails] = useState(false);
  let { context } = error;
  let stringifiedResponse = context?.json
    ? JSON.stringify(context.json, null, 2)
    : null;

  let renderContext = () => {
    if (context) {
      return (
        <div style={styles.context}>
          <div>Status</div>
          <div>Body</div>
          <code>{context.response.status}</code>
          <pre style={styles.pre}>
            <code>{stringifiedResponse || "<not parsed>"}</code>
          </pre>
        </div>
      );
    } else {
      return null;
    }
  };

  let summary = context?.json ? context.json.error?.summary : null;

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.h1}>Decode encountered an error</h1>
        <p>{summary ? summary : error.message}</p>
        {showDetails ? (
          <>
            <span
              onClick={() => setShowDetails(false)}
              style={{ cursor: "pointer" }}
            >
              ▼ Hide details
            </span>
            {renderContext()}
          </>
        ) : (
          <span
            onClick={() => setShowDetails(true)}
            style={{ cursor: "pointer" }}
          >
            ▶ Show details
          </span>
        )}
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
    display: "grid",
    gridTemplateColumns: "80px 1fr",
    fontFamily: "monospace",
  },
  pre: {
    backgroundColor: "#333",
    padding: "15px",
    borderRadius: "8px",
    fontSize: "0.8em",
    whiteSpace: "pre-wrap" as "pre-wrap",
    color: "#fff",
  },
};
