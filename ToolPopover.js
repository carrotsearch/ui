import React from "react";

import "./ToolPopover.css";

import classnames from "classnames";

import { Popover, Position } from "@blueprintjs/core";
import { wrapIfNotArray } from "./lang/arrays.js";

export const ToolPopover = ({
  children,
  position = Position.BOTTOM_RIGHT,
  popoverClassName,
  ...props
}) => {
  const childrenArray = wrapIfNotArray(children);
  return (
    <Popover
      position={position}
      autoFocus={true}
      popoverClassName={classnames("ToolPopover", popoverClassName)}
      boundary="viewport"
      {...props}
    >
      {childrenArray[0]}
      {childrenArray[1]}
    </Popover>
  );
};