import React from "react";

import { view } from "@risingstack/react-easy-state";
import { StringSetting } from "./StringSetting";

export const StringArrayTextAreaSetting = view(
  ({ setting, get, set, search }) => {
    const getStringFromArray = setting => get(setting).join("\n");
    const setArrayFromString = (setting, value) =>
      set(setting, value.split("\n"));

    return (
      <StringSetting
        setting={{ ...setting, multiLine: true }}
        search={search}
        get={getStringFromArray}
        set={setArrayFromString}
      />
    );
  }
);
