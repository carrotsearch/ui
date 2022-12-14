import React from "react";

import { view } from "@risingstack/react-easy-state";
import classnames from "classnames";

import { displayNoneIf } from "./Optional.js";
import { SectionDivider } from "./SectionDivider";

import "./Section.css";

export const Section = view(
  ({ label, children, className, style, folded, onHeaderClick }) => {
    const isFolded = folded ? folded() : false;
    return (
      <section className={classnames("Section", className)} style={style}>
        <SectionDivider
          label={label}
          folded={isFolded}
          onHeaderClick={onHeaderClick}
        />
        <div style={displayNoneIf(isFolded)}>{children}</div>
      </section>
    );
  }
);
