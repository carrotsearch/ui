import React from "react";

import "./Transitioned.css";

import classnames from "classnames";

export const Transitioned = ({ visible, children }) => {
  return (
    <div
      className={classnames("Transitioned", {
        visible: visible
      })}
    >
      {children}
    </div>
  );
};
