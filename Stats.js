import React from "react";

import "./Stats.css";

import classnames from "classnames";
import { humanizeCount, pluralize } from "./lang/humanize.js";

export const countStat = ({ count, what, id = "", divider = false, title }) => {
  return {
    id: `${what}:count:${id}`,
    value: humanizeCount(count),
    label: pluralize(count, what, false),
    divider: divider,
    title: title
  };
};

const StatValue = ({ value }) => {
  if (typeof value === "string") {
    if (value.endsWith("%")) {
      return (
        <strong>
          {value.substring(0, value.length - 1)}
          <small className="percent">%</small>
        </strong>
      );
    }
  }

  return <strong>{value}</strong>;
};

export const Stat = ({
  value,
  label,
  className,
  divider = false,
  title = ""
}) => {
  return (
    <div
      className={classnames("Stat", className, { WithDivider: divider })}
      title={title}
    >
      <StatValue value={value} />
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
