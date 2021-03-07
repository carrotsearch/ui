import React, { useEffect, useState } from "react";
import { Popover, PopoverPosition } from "@blueprintjs/core";

export const DescriptionPopover = ({ description, children }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const listener = e => {
      if (e.keyCode === 27) {
        setOpen(false);
      }
    };
    document.body.addEventListener("keydown", listener);
    return () => {
      document.body.removeEventListener("keydown", listener);
    };
  }, []);
  return (
    <Popover
      content={<Description description={description} />}
      position={PopoverPosition.RIGHT_BOTTOM}
      canEscapeKeyClose={true}
      isOpen={open}
      onInteraction={setOpen}
      boundary="viewport"
    >
      {children}
    </Popover>
  );
};

const Description = ({ description }) => {
  return typeof description === "string" ? (
    <div
      className="SettingDescription"
      dangerouslySetInnerHTML={{ __html: description }}
    />
  ) : (
    <div className="SettingDescription">{description}</div>
  );
};
