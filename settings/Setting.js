import React from "react";

import "./Setting.css";

import { FormGroup } from "@blueprintjs/core";
import { VscQuestion } from "react-icons/vsc";
import { DescriptionPopover } from "../DescriptionPopover.js";
import { SearchHighlight } from "../fuzzysearch.js";

export const LabelWithHelp = ({
  label,
  description,
  search,
  labelSearchTarget
}) => {
  if (description) {
    return (
      <div className="LabelWithHelp">
        <SearchHighlight
          text={label}
          target={labelSearchTarget}
          search={search}
        />
        <SettingDescriptionPopover description={description} />
      </div>
    );
  } else {
    return (
      <SearchHighlight
        text={label}
        target={labelSearchTarget}
        search={search}
      />
    );
  }
};

export const SettingDescriptionPopover = ({ description }) => {
  return (
    <DescriptionPopover description={description}>
      <VscQuestion className="HelpIcon VscQuestion" />
    </DescriptionPopover>
  );
};

export const Setting = ({
  className,
  inline = false,
  label,
  description,
  message,
  search,
  labelSearchTarget,
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
      label={
        <LabelWithHelp
          label={label}
          description={description}
          search={search}
          labelSearchTarget={labelSearchTarget}
        />
      }
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
