import React from "react";

import "./Setting.css";

import { FormGroup } from "@blueprintjs/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/pro-regular-svg-icons";
import { DescriptionPopover } from "../DescriptionPopover.js";

export const isSettingVisible = s => !s.visible || s.visible();

export const LabelWithHelp = ({ label, description }) => {
  if (description) {
    return (
      <div className="LabelWithHelp">
        {label}
        <SettingDescriptionPopover description={description} />
      </div>
    );
  } else {
    return label;
  }
};

export const SettingDescriptionPopover = ({ description }) => {
  return (
    <DescriptionPopover description={description}>
      <FontAwesomeIcon className="HelpIcon" icon={faQuestionCircle} />
    </DescriptionPopover>
  );
};

export const Setting = ({
  className,
  inline = false,
  label,
  description,
  message,
  children
}) => {
  let messageElement;
  if (message) {
    messageElement = <div className="SettingMessage">{message}</div>;
  }
  return (
    <FormGroup
      className={`${className} Setting`}
      inline={inline}
      label={<LabelWithHelp label={label} description={description} />}
    >
      {children}
      {messageElement}
    </FormGroup>
  );
};

export const storeAccessors = (store, property) => {
  return {
    get: () => store[property],
    set: (s, val) => (store[property] = val)
  };
};
