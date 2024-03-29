import React from "react";

import "./ServiceUrlSetting.css";

import classnames from "classnames";

import { store, view } from "@risingstack/react-easy-state";

import { Button, ControlGroup, InputGroup } from "@blueprintjs/core";

import { Setting } from "./Setting.js";
import { LogEntry } from "../LogEntries.js";
import { VscCheck, VscPlug } from "react-icons/vsc";

export const ConnectButton = view(({ store, onClick }) => {
  const ok = store.status === "ok";
  return (
    <Button
      className={classnames({ ExtraPadding: !ok })}
      icon={ok ? <VscCheck /> : <VscPlug />}
      intent={ok ? "success" : "none"}
      title={ok ? "Connected" : "Connect to Solr"}
      text={ok ? "" : "Connect"}
      loading={store.status === "loading"}
      onClick={onClick}
      outlined={ok}
    />
  );
});

export const createStateStore = overrides => {
  const urlStore = store(
    Object.assign(
      {
        message: null,
        status: "pending",
        urlDirty: () => {
          urlStore.status = "pending";
        }
      },
      overrides
    )
  );
  return urlStore;
};

export const ServiceUrlSetting = view(({ setting, get, set, search }) => {
  const { label, description, stateStore, checkUrl } = setting;

  const urlStore = store({
    url: get(setting),
    setUrl: url => {
      urlStore.url = url;
      stateStore.urlDirty();
    }
  });

  const message = stateStore.message ? (
    <LogEntry entry={{ level: "error", message: stateStore.message }} />
  ) : null;

  return (
    <Setting
      className="ServiceUrlSetting"
      label={label}
      description={description}
      message={message}
      search={search}
      labelSearchTarget={setting.labelSearchTarget}
    >
      <ControlGroup fill={true}>
        <InputGroup
          value={urlStore.url}
          fill={true}
          onChange={e => urlStore.setUrl(e.target.value)}
        />
        <ConnectButton
          store={stateStore}
          onClick={() => checkUrl(urlStore.url)}
        />
      </ControlGroup>
    </Setting>
  );
});
