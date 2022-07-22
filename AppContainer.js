import React, { useEffect, useState, Suspense } from "react";

import "./AppContainer.css";

import classnames from "classnames";

import { view } from "@risingstack/react-easy-state";

import {
  HashRouter as Router,
  Link,
  NavLink,
  Redirect,
  Route,
  Switch,
  useLocation,
  useRouteMatch
} from "react-router-dom";

import {
  Button,
  Popover,
  PopoverInteractionKind,
  PopoverPosition
} from "@blueprintjs/core";

import { VscError } from "react-icons/vsc";

import { errors } from "./store/errors.js";
import { ThemeSwitch } from "./ThemeSwitch.js";
import { ToolPopover } from "./ToolPopover.js";
import { Loading } from "./Loading.js";

const AppLink = ({ to, title, children, icon }) => {
  const [open, setOpen] = useState(false);
  const match = useRouteMatch(to);
  return (
    <NavLink
      onClick={() => setOpen(false)}
      className="NavLink AppLink"
      to={to}
      activeClassName="active"
    >
      <NavLinkContent
        icon={icon}
        title={title}
        open={open}
        onTooltipInteraction={visible => setOpen(visible && !match)}
      >
        {children}
      </NavLinkContent>
    </NavLink>
  );
};

const NavExternalLink = ({ href, title, icon, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <a
      className="NavLink"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <NavLinkContent
        icon={icon}
        title={title}
        open={open}
        onTooltipInteraction={visible => setOpen(visible)}
      >
        {children}
      </NavLinkContent>
    </a>
  );
};

const NavLinkContent = ({
  icon,
  title,
  children,
  open,
  onTooltipInteraction
}) => {
  const handlePopoverInteraction = nextOpenState => {
    onTooltipInteraction(nextOpenState);
  };

  return (
    <ToolPopover
      position={PopoverPosition.RIGHT}
      interactionKind={PopoverInteractionKind.HOVER}
      onInteraction={handlePopoverInteraction}
      hoverOpenDelay={450}
      isOpen={open}
      popoverClassName="NavPopover"
    >
      {React.isValidElement(icon) ? icon : null}
      <div>
        <h3>{title}</h3>
        {children}
      </div>
    </ToolPopover>
  );
};

export const AppContainerInternal = ({
  logo,
  apps,
  extras,
  containerClassName,
  children
}) => {
  const allApps = [apps, extras]
    .reduce((apps, input) => {
      if (input?.props?.children) {
        if (Array.isArray(input.props.children)) {
          input.props.children.forEach(a => apps.push(a));
        } else {
          apps.push(input.props.children);
        }
      }
      return apps;
    }, [])
    .filter(e => !!e.props.component);
  const defaultApp = allApps.find(a => a.props.default) || allApps[0];

  const location = useLocation();
  const className = containerClassName?.(location);

  return (
    <div className={classnames("AppContainer", className)}>
      {children}

      <nav>
        <Link to="/">{logo}</Link>

        {apps}

        <div className="NavExtras">
          {extras}
          <ThemeSwitch />
        </div>
      </nav>

      <main>
        <Router>
          <Switch>
            <Redirect from="/" to={defaultApp.props.path} exact />
            {allApps.map(app => {
              return (
                <Route
                  key={app.props.path}
                  path={app.props.path}
                  render={() => (
                    <Suspense fallback={<Loading isLoading={() => true} />}>
                      {React.createElement(app.props.component)}
                    </Suspense>
                  )}
                />
              );
            })}
            <Redirect to={defaultApp.props.path} />
          </Switch>
        </Router>
        <AppError />
      </main>
    </div>
  );
};

export const App = ({ path, component, icon, title, children }) => {
  return component ? (
    <AppLink to={path} title={title} icon={icon}>
      {children}
    </AppLink>
  ) : (
    <NavExternalLink href={path} icon={icon} title={title}>
      {children}
    </NavExternalLink>
  );
};

export const AppErrorContent = ({ children }) => {
  if (!children) {
    return null;
  }

  return (
    <div>
      <VscError size="2em" />
      {children}

      <div className="AppErrorButtons">
        <Button outlined={false} onClick={() => errors.dismiss()}>
          Dismiss
        </Button>
      </div>
    </div>
  );
};

export const AppError = view(() => {
  const errorElement = errors.current;

  useEffect(() => {
    const listener = e => {
      if (errors.current && e.keyCode === 27) {
        errors.dismiss();
      }
    };
    window.addEventListener("keyup", listener);

    return () => {
      window.removeEventListener("keyup", listener);
    };
  }, []);

  return (
    <div className={classnames("AppError", { visible: errorElement !== null })}>
      <AppErrorContent>{errorElement}</AppErrorContent>
    </div>
  );
});

export const AppContainer = ({ containerClassName, children }) => {
  const logo = children[0];
  const apps = children[1];
  const extras = children[2];
  const more = children[3];

  return (
    <Router>
      <Switch>
        <Route path="/">
          <AppContainerInternal
            containerClassName={containerClassName}
            logo={logo}
            apps={apps}
            extras={extras}
          >
            {more}
          </AppContainerInternal>
        </Route>
      </Switch>
    </Router>
  );
};
