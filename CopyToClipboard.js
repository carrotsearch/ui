import React, { useRef, useState } from "react";

import { Button, Classes } from "@blueprintjs/core";
import { VscClippy, VscCheck, VscClose } from "react-icons/vsc";

import copyToClipboard from "clipboard-copy";
import { ButtonLink } from "./ButtonLink.js";

import "./CopyToClipboard.css";

const useCopy = contentProvider => {
  const [copyStatus, setCopyStatus] = useState("none");
  const timeout = useRef();

  const copy = async () => {
    const content = await contentProvider();

    let success;
    try {
      await copyToClipboard(content);
      success = true;
    } catch (ignored) {
      success = false;
    }

    setCopyStatus(success ? "success" : "error");
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => {
      setCopyStatus("none");
      timeout.current = undefined;
    }, 1000);
  };

  return [copy, copyStatus];
};

const CopyStatusInline = ({ copyStatus }) => {
  switch (copyStatus) {
    case "success":
      return (
        <span className="CopyStatusInline">
          (<VscCheck /> copied)
        </span>
      );
    case "error":
      return (
        <span className="CopyStatusInline">
          (<VscClose /> couldn't copy)
        </span>
      );

    default:
      return null;
  }
};

export const CopyToClipboardLink = ({
  contentProvider,
  text = "Copy to clipboard"
}) => {
  const [copy, copyStatus] = useCopy(contentProvider);

  return (
    <>
      <ButtonLink onClick={copy}>{text}</ButtonLink>
      <CopyStatusInline copyStatus={copyStatus} />
    </>
  );
};

export const CopyToClipboard = ({
  contentProvider,
  buttonText = "Copy to clipboard",
  buttonProps = { small: true, minimal: true }
}) => {
  const [copy, copyStatus] = useCopy(contentProvider);

  let iconProps;
  switch (copyStatus) {
    case "success":
      iconProps = {
        icon: <VscCheck />,
        intent: "success",
        text: "Copied"
      };
      break;
    case "error":
      iconProps = {
        icon: <VscClose />,
        intent: "error",
        text: "Couldn't copy"
      };
      break;
    default:
      iconProps = {
        icon: <VscClippy />,
        text: buttonText,
        title: "Copy to clipboard"
      };
      break;
  }

  return (
    <Button
      {...iconProps}
      {...buttonProps}
      className={Classes.FIXED + " CopyToClipboard"}
      onClick={copy}
    />
  );
};
