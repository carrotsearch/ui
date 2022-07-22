import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import classNames from "classnames";
import { view } from "@risingstack/react-easy-state";

import { Button, Classes, ControlGroup, Tab } from "@blueprintjs/core";
import { PointedTabs } from "./PointedTabs.js";
import { ToolPopover } from "./ToolPopover.js";

import "./Views.css";

const ShowHide = props => {
  return (
    <span
      className={props.className}
      data-tool-id={props.id}
      title={props.title}
      style={props.visible ? {} : { display: "none" }}
    >
      {props.children}
    </span>
  );
};

export const Tool = ({ tool, id, visible, props }) => {
  if (tool.icon) {
    return (
      <ToolPopover
        className={Classes.FIXED}
        disabled={!visible}
        position={tool.position}
      >
        <ShowHide visible={visible} className="view-tool-trigger">
          <Button
            data-tool-id={id}
            icon={
              tool.icon.prefix ? (
                <b title="Support for FontAwesome removed">!!!</b>
              ) : (
                tool.icon
              )
            }
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
        id={id}
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

const Switch = ({ visible, createElement, overflow }) => {
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
      className={classNames({
        ViewVisible: visible,
        ViewHidden: !visible,
        ViewOverflowHidden: overflow === "hidden",
        ViewOverflowVisible: overflow === "visible",
        ViewOverflowAuto: overflow === "auto"
      })}
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
                <Tool key={key} id={key} tool={t} visible={activeView === v} />
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
              overflow={allViews[v].overflow || "auto"}
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

export const renderIfNextVisible = comp =>
  React.memo(comp, (prev, next) => !next["visible"]);

/**
 * Wraps a component in an react-easy-state view in such a way that the
 * component renders only if the "visible" property passed to it is true.
 * If "visible" is false, the component doesn't render even if the
 * "inner" react-easy-state store changes and would normally force a
 * re-render.
 *
 * This is useful for wrapping components rendering the content in the
 * tabbed view. If the view has many tabs, we don't want to eagerly render
 * all tabs if the underlying data changes. Instead, we only want to re-render
 * the visible tab and render the remaining tabs only when they become visible,
 * if at all.
 */
export const lazyView = component => {
  const Lazy = renderIfNextVisible(props => component(props));
  return view(props => <Lazy {...props} />);
};
