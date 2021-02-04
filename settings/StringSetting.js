import React from "react";

import { view } from "@risingstack/react-easy-state";

import { InputGroup, TextArea } from "@blueprintjs/core";
import { Setting } from "./Setting.js";

export const StringSetting = view(
  ({ setting, get, set }) => {
    const { label, description, multiLine = false } = setting;

    return (
      <Setting
        className="StringSetting"
        label={label}
        description={description}
      >
        {multiLine ? (
          <TextArea
            style={{ width: "100%", minHeight: "8rem" }}
            value={get(setting)}
            onChange={e => set(setting, e.target.value)}
          />
        ) : (
          <InputGroup
            value={get(setting)}
            onChange={e => set(setting, e.target.value)}
          />
        )}
      </Setting>
    );
  }
);
