import React from "react";

import "./Stats.css";

import classnames from "classnames";
import { humanizeCount, pluralize } from "./lang/humanize.js";

export const countStat = ({ count, what, id = "", divider = false }) => {
  return {
    id: `${what}:count:${id}`,
    value: humanizeCount(count),
    label: pluralize(count, what, false),
    divider: divider
  };
};

export const Stat = ({ value, label, className, divider = false }) => {
  return (
    <div className={classnames("Stat", className, { WithDivider: divider })}>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
};

export const Stats = ({ stats, divided }) => {
  return (
    <div className={classnames("Stats", { WithDivider: divided })}>
      {stats
        .filter(s => s.value !== undefined)
        .map(s => (
          <Stat key={s.id} {...s} />
        ))}
    </div>
  );
};
