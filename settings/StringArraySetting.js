import React from "react";

import { view } from "@risingstack/react-easy-state";

import { TagInput } from "@blueprintjs/core";
import { Setting } from "./Setting.js";

export const StringArraySetting = view(({ setting, get, set, search }) => {
  const { label, description } = setting;

  return (
    <Setting
      className="StringListSetting"
      label={label}
      description={description}
      search={search}
      labelSearchTarget={setting.labelSearchTarget}
    >
      <TagInput
        values={get(setting)}
        onChange={strings => set(setting, strings)}
        fill={true}
        tagProps={{ minimal: true, intent: "primary" }}
        addOnBlur={true}
      />
    </Setting>
  );
});
