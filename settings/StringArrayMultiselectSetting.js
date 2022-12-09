import React from "react";

import "./StringArrayMultiselectSetting.css";

import { Checkbox } from "@blueprintjs/core";

import { view } from "@risingstack/react-easy-state";
import { Setting } from "./Setting";

export const StringArrayMultiselectSetting = view(
  ({ setting, get, set, search }) => {
    const { label, description, options } = setting;

    const selectedValues = new Set(get(setting));

    const updateValue = (value, checked) => {
      if (checked) {
        selectedValues.add(value);
      } else {
        selectedValues.delete(value);
      }
      set(setting, [...selectedValues]);
    };

    return (
      <Setting
        className="StringArrayMultiselectSetting"
        label={label}
        description={description}
        search={search}
        labelSearchTarget={setting.labelSearchTarget}
      >
        <div>
          {options.map(o => {
            return (
              <Checkbox
                key={o.value}
                label={o.label || o.value}
                checked={selectedValues.has(o.value)}
                onChange={e => updateValue(o.value, e.target.checked)}
              />
            );
          })}
        </div>
      </Setting>
    );
  }
);
