import React from "react";

import "./Stats.css";

import classnames from "classnames";

export const Stat = ({ value, label }) => {
  return (
    <div className="Stat">
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
