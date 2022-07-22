import React from "react";

import "./LogEntries.css";

import { view } from "@risingstack/react-easy-state";
import { VscInfo, VscWarning, VscError } from "react-icons/vsc";

export const ArrayLogger = function () {
  const entries = [];

  this.log = message => entries.push({ level: "info", message: message });
  this.warn = message => entries.push({ level: "warning", message: message });
  this.error = message => entries.push({ level: "error", message: message });
  this.getEntries = () => entries.slice(0);
};

const LEVEL_ICONS = {
  error: () => <VscError />,
  warning: () => <VscWarning />,
  info: () => <VscInfo />
};

export const LogEntry = ({ entry }) => {
  const { level, message } = entry;
  return (
    <div className={`LogEntry LogEntry-${level}`}>
      {LEVEL_ICONS[level]()} {message}
    </div>
  );
};

export const LogEntries = view(({ entries }) => {
  return (
    <>
      {entries.map((e, i) => (
        <LogEntry entry={e} key={i} />
      ))}
    </>
  );
});
