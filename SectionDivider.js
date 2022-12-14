import React from "react";

import "./SectionDivider.css";

import classnames from "classnames";

export const SectionDivider = ({ label, folded, onHeaderClick }) => {
  if (!label) {
    return null;
  }

  return (
    <h4 className="SectionDivider">
      <span onClick={onHeaderClick}>
        {label}
        {onHeaderClick ? (
          <span className={classnames("Caret", { CaretRight: folded })} />
        ) : null}
      </span>
    </h4>
  );
};
