import React from "react";
import "./BooleanSetting.css";

import { Checkbox, FormGroup } from "@blueprintjs/core";
import { view } from "@risingstack/react-easy-state";
import { SettingDescriptionPopover } from "./Setting.js";
import { SearchHighlight } from "../fuzzysearch.js";

export const BooleanSetting = view(({ setting, get, set, search }) => {
  const { description } = setting;
  return (
    <FormGroup className="BooleanSetting Setting">
      <Checkbox
        checked={get(setting)}
        label={
          <SearchHighlight
            text={setting.label}
            search={search}
            target={setting.labelSearchTarget}
          />
        }
        inline={true}
        onChange={e => set(setting, e.target.checked)}
      />
      {description ? (
        <SettingDescriptionPopover description={description} />
      ) : null}
    </FormGroup>
  );
});
