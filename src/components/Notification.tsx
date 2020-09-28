import React from "react";
import RCNotification from "rc-notification";
import { NotificationInstance as RCNotificationInstance } from "rc-notification/lib/Notification";
import styles from "./Notification.module.css";

let rcInstances: { [id: string]: RCNotificationInstance } = {};
type NotificationPlacement =
  | "topRight"
  | "bottomRight"
  | "bottomLeft"
  | "topLeft";

let defaultPlacement = "topRight";

interface ArgsProps {
  message: React.ReactNode;
  description?: React.ReactNode;
  key?: string;
  onClose?: () => void;
  onClick?: () => void;
  duration?: number | null;
  icon?: React.ReactNode;
  placement?: NotificationPlacement;
}

function getNotificationInstance(placement?: NotificationPlacement) {
  return new Promise<RCNotificationInstance>((resolve) => {
    if (rcInstances[placement || defaultPlacement]) {
      resolve(rcInstances[placement || defaultPlacement]);
      return;
    }

    RCNotification.newInstance(
      {
        prefixCls: styles[`notification-${placement || defaultPlacement}`],
        className: styles.root,
      },
      (instance) => {
        rcInstances[placement || defaultPlacement] = instance;
        resolve(rcInstances[placement || defaultPlacement]);
      }
    );
  });
}

function formatContent(args: ArgsProps) {
  return (
    <div className={styles.container}>
      {args.icon && <div className={styles.icon}>{args.icon}</div>}
      <div className={styles.content}>
        <div className={styles.message}>{args.message}</div>
        {args.description && (
          <div className={styles.description}>{args.description}</div>
        )}
      </div>
    </div>
  );
}

async function open(args: ArgsProps) {
  let notification = await getNotificationInstance(args.placement);

  notification.notice({
    ...args,
    content: formatContent(args),
  });
}

function destroy() {
  for (const key in rcInstances) {
    if (Object.prototype.hasOwnProperty.call(rcInstances, key)) {
      const notification = rcInstances[key];
      notification.destroy();
      delete rcInstances[key];
    }
  }
}

function close(key: string) {
  for (const nkey in rcInstances) {
    if (Object.prototype.hasOwnProperty.call(rcInstances, nkey)) {
      const notification = rcInstances[nkey];
      notification.removeNotice(key);
    }
  }
}

let api = { open, destroy, close };

export let notification = api;
