import React from "react";

import "./TextAreaWithCopyToClipboard.css";

import { FormGroup, TextArea } from "@blueprintjs/core";
import { CopyToClipboard } from "@carrotsearch/ui/CopyToClipboard.js";

const LabelWithCopyToClipboard = props => {
  return (
    <>
      {props.label}
      <CopyToClipboard contentProvider={props.contentProvider} buttonText="Copy" />
    </>
  );
};
export const TextAreaWithCopyToClipboard = props => {
  return (
    <FormGroup
      className="TextAreaWithCopyToClipboard"
      label={
        <LabelWithCopyToClipboard
          label={props.label}
          contentProvider={props.contentProvider}
        />
      }
    >
      <TextArea value={props.contentProvider()} readOnly={true} />
    </FormGroup>
  );
};
