import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { view } from "@risingstack/react-easy-state";

import { Section } from "../Section.js";
import { RadioSetting } from "./RadioSetting.js";
import { BooleanSetting } from "./BooleanSetting.js";
import { StringSetting } from "./StringSetting.js";
import { NumericSetting, NumericSettingSimple } from "./NumericSetting.js";
import { SelectSetting } from "./SelectSetting.js";
import { StringArraySetting } from "./StringArraySetting.js";
import { FileSetting } from "./FileSetting.js";
import { ServiceUrlSetting } from "./ServiceUrlSetting.js";
import { displayNoneIf } from "../Optional.js";
import { DeferredPlaceholder } from "../Deferred.js";

import { checkSearchMatch, SearchHighlight } from "../fuzzysearch.js";

const isSettingVisible = (s, arg) =>
  (!s.visible || s.visible(arg)) && (!s.enabled || s.enable());

const useDeferredDisplay = (setting, timeout) => {
  const { settings, ...deferredSetting } = { ...setting };
  const [deferred, setDeferred] = useState(true);

  useEffect(() => {
    const to = setTimeout(() => {
      setDeferred(false);
    }, timeout);
    return () => {
      clearTimeout(to);
    };
  }, [setDeferred, timeout]);

  const allVisible = settings.filter(isSettingVisible);
  deferredSetting.settings = deferred ? allVisible.slice(0, 1) : settings;

  return [deferredSetting, deferred && allVisible.length > 1];
};

export const DeferredGroups = view(({ timeout, setting, ...props }) => {
  const [deferredSetting, hasMore] = useDeferredDisplay(setting, timeout);
  const initializing = hasMore ? <DeferredPlaceholder /> : null;
  return (
    <>
      <Group setting={deferredSetting} {...props} />
      {initializing}
    </>
  );
});

export const Group = view(({ setting, get, set, className, search }) => {
  const {
    label,
    labelSearchTarget,
    description,
    descriptionSearchTarget
  } = setting;

  // We handle visibility of settings and groups by hiding the corresponding elements
  // rather than by removing/adding them to the DOM. The former is much faster.
  const groupVisible = isSettingVisible(setting);

  // If the group matches the search query, show all child settings,
  // even if they don't match the search.
  const labelMatch = checkSearchMatch(search, labelSearchTarget);
  const descriptionMatch = checkSearchMatch(search, descriptionSearchTarget);
  const groupMatchesSearch = labelMatch !== null || descriptionMatch !== null;

  let anyChildVisible = false;
  const settings = setting.settings.map(s => {
    const settingVisible = isSettingVisible(s, groupMatchesSearch);
    anyChildVisible |= settingVisible;
    return (
      <section key={s.id} id={s.id} style={displayNoneIf(!settingVisible)}>
        {(s.factory || getFactory(s))(
          s,
          s.get || setting.get || get,
          s.set || setting.set || set,
          search
        )}
      </section>
    );
  });

  const showGroup = groupVisible && anyChildVisible;

  if (label) {
    return (
      <Section
        className={className}
        label={
          <SearchHighlight
            result={labelMatch}
            text={label}
          />
        }
        style={displayNoneIf(!showGroup)}
        folded={setting.folded}
        onHeaderClick={setting.onHeaderClick}
        search={search}
      >
        <SearchHighlight
          result={descriptionMatch}
          text={description}
          elementType="p"
        />
        {settings}
      </Section>
    );
  } else {
    return (
      <section className={className} style={displayNoneIf(!showGroup)}>
        {settings}
      </section>
    );
  }
});

const factories = {
  group: (s, get, set, search) => {
    return <Group setting={s} get={get} set={set} search={search} />;
  },

  boolean: (s, get, set, search) => {
    return <BooleanSetting setting={s} get={get} set={set} search={search} />;
  },

  string: (s, get, set, search) => {
    return <StringSetting setting={s} get={get} set={set} search={search} />;
  },

  file: (s, get, set, search) => {
    return <FileSetting setting={s} get={get} set={set} search={search} />;
  },

  "string-array": (s, get, set, search) => {
    return (
      <StringArraySetting setting={s} get={get} set={set} search={search} />
    );
  },

  enum: (s, get, set, search) => {
    if (s.ui === "radio") {
      return <RadioSetting setting={s} get={get} set={set} search={search} />;
    }
    if (s.ui === "select") {
      return <SelectSetting setting={s} get={get} set={set} search={search} />;
    }
  },
  number: (s, get, set, search) => {
    if (Number.isFinite(s.min) && Number.isFinite(s.max)) {
      return <NumericSetting setting={s} get={get} set={set} search={search} />;
    } else {
      return (
        <NumericSettingSimple setting={s} get={get} set={set} search={search} />
      );
    }
  },

  "service-url": (s, get, set, search) => {
    return (
      <ServiceUrlSetting setting={s} get={get} set={set} search={search} />
    );
  }
};
const getFactory = s => {
  const factory = factories[s.type];
  if (!factory) {
    throw new Error(`Unknown factory for setting type: ${s.type}`);
  }
  return factory;
};

export const addFactory = (type, factory) => (factories[type] = factory);

Group.propTypes = {
  setting: PropTypes.object.isRequired
};
