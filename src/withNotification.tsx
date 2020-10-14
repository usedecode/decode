import React from "react";
import {
  CheckCircleOutlined,
  FrownOutlined,
  LoadingOutlined,
} from "./components/antd/icons";
import { notification } from "./components/Notification";

export default async function withNotification<T>(
  func: () => Promise<T>,
  slug: string,
  show: "all" | "fail" = "all"
) {
  // Don't open "processing" notification immediately
  let notificationTimeout = setTimeout(async () => {
    await notification.open({
      message: (
        <span>
          Processing request{" "}
          <span style={{ fontFamily: "monospace" }}>{slug}</span>...
        </span>
      ),
      icon: <LoadingOutlined />,
      duration: 30,
    });
  }, 750);

  try {
    let res = await func();
    clearTimeout(notificationTimeout);
    notification.destroy();

    if (show === "all")
      await notification.open({
        message: (
          <span>
            Request <span style={{ fontFamily: "monospace" }}>{slug}</span> ran
            successfully
          </span>
        ),
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        duration: 2,
      });

    return res;
  } catch (e) {
    clearTimeout(notificationTimeout);
    notification.destroy();
    console.error(`Error when making request to Decode: ${e}`);

    let summary;
    try {
      summary = e.context.json.error.summary;
    } catch (e) {}

    await notification.open({
      message: (
        <div>
          <p>
            Request <span style={{ fontFamily: "monospace" }}>{slug}</span>{" "}
            failed to run. See console for more details.
          </p>
          <p>
            Error (for nerds):{" "}
            <span style={{ fontFamily: "monospace" }}>
              {summary ? summary : `${e}`}
            </span>
          </p>
        </div>
      ),
      icon: <FrownOutlined style={{ color: "#cf1322" }} />,
      duration: 6,
    });

    throw e;
  }
}
