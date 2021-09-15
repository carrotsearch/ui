import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Classes, ControlGroup, Tab } from "@blueprintjs/core";
import { PointedTabs } from "./PointedTabs.js";

import "./Views.css";
import { ToolPopover } from "./ToolPopover.js";

const ShowHide = props => {
  return (
    <span
      className={props.className}
      title={props.title}
      style={props.visible ? {} : { display: "none" }}
    >
      {props.children}
    </span>
  );
};

export const Tool = ({ tool, visible, props }) => {
  if (tool.icon) {
    return (
      <ToolPopover
        className={Classes.FIXED}
        disabled={!visible}
        position={tool.position}
      >
        <ShowHide visible={visible} className="view-tool-trigger">
          <Button
            icon={<FontAwesomeIcon icon={tool.icon} />}
            minimal={true}
            title={tool.title}
          />
        </ShowHide>
        {tool.createContentElement(props)}
      </ToolPopover>
    );
  } else {
    return (
      <ShowHide
        visible={visible}
        className={Classes.FIXED + " view-tool-trigger"}
        title={tool.title}
      >
        {tool.createContentElement(props)}
      </ShowHide>
    );
  }
};

// Don't render if the contents of the tab is not visible.
const SwitchContent = React.memo(
  ({ visible, createElement }) => {
    return <>{createElement(visible)}</>;
  },
  (prev, next) => {
    return !next.visible;
  }
);

const Switch = ({ visible, createElement }) => {
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (visible) {
      setInitialized(true);
    }
  }, [visible]);

  if (!initialized) {
    return null;
  }

  return (
    <div
      style={{
        visibility: visible ? "visible" : "hidden"
      }}
    >
      <SwitchContent visible={visible} createElement={createElement} />
    </div>
  );
};

Switch.propTypes = {
  visible: PropTypes.bool.isRequired,
  createElement: PropTypes.func.isRequired
};

export const flattenViews = views =>
  views.reduce((map, group) => {
    Object.assign(map, group.views);
    return map;
  }, {});

export const Views = ({
  views,
  className,
  activeView,
  onViewChange,
  children
}) => {
  // Flatten views from all groups into a single object.
  const allViews = flattenViews(views);

  const viewKeys = Object.keys(allViews);
  return (
    <div className={classNames("Views", className)}>
      <ControlGroup className="ViewsTabs" fill={true} vertical={false}>
        <PointedTabs selectedTabId={activeView} onChange={onViewChange}>
          {views.map(group => {
            const components = [];
            if (group.label) {
              components.push(
                <div className="TabGroupLabel" key={group.label}>
                  {group.label}
                </div>
              );
            }

            return components.concat(
              Object.keys(group.views).map(v => {
                return <Tab key={v} id={v} title={allViews[v].label} />;
              })
            );
          })}
        </PointedTabs>
        {viewKeys
          .filter(v => allViews[v].tools && allViews[v].tools.length > 0)
          .reduce(function (tools, v) {
            allViews[v].tools.forEach(t => {
              const key = v + "." + t.id;
              tools.push(
                <Tool key={key} tool={t} visible={activeView === v} />
              );
            });
            return tools;
          }, [])}
      </ControlGroup>
      <div className="ViewsContent">
        {children}
        {viewKeys.map(v => {
          return (
            <Switch
              key={v}
              visible={v === activeView}
              createElement={allViews[v].createContentElement}
            />
          );
        })}
      </div>
    </div>
  );
};

Views.propTypes = {
  activeView: PropTypes.string.isRequired,
  views: PropTypes.array.isRequired,
  onViewChange: PropTypes.func.isRequired
};
