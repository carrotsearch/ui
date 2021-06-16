import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

import debounce from "lodash.debounce";

Visualization.propTypes = {
  impl: PropTypes.object.isRequired,
  implRef: PropTypes.object,
  options: PropTypes.object,
  dataObject: PropTypes.object.isRequired,
  selection: PropTypes.array
};

/**
 * Implementation base for Circles and FoamTree.
 */
export function Visualization(props) {
  const element = useRef(null);
  const instance = useRef(null);

  // Dispose on unmount
  useEffect(() => {
    return () => {
      if (instance.current) {
        props.impl.dispose(instance.current);
        instance.current = undefined;
      }
    };
  }, [props.impl]);

  useEffect(() => {
    if (instance.current) {
      props.impl.set(instance.current, props.options);
    } else {
      instance.current = props.impl.embed({
        element: element.current,
        pixelRatio: window.devicePixelRatio || 1,
        ...props.options
      });
      if (props.implRef) {
        props.implRef.setCurrent(instance.current);
      }
    }
  }, [props.options, props.impl, props.implRef]);

  useEffect(() => {
    if (instance.current) {
      props.impl.set(instance.current, "dataObject", props.dataObject);
    }
  }, [props.dataObject, props.impl]);

  useEffect(() => {
    if (instance.current) {
      props.impl.select(instance.current, {
        groups: props.selection,
        keepPrevious: false
      });
    }
  }, [props.selection, props.impl]);

  const resizeObserver = useRef(
    new ResizeObserver(
      debounce(() => {
        if (instance.current) {
          props.impl.resize(instance.current);
        }
      }, 100)
    )
  );
  useEffect(() => {
    const el = element.current;
    if (el) {
      resizeObserver.current.observe(el);
    }

    return () => {
      resizeObserver.current.unobserve(el);
    };
  }, [props.impl]);

  const style = { position: "absolute", top: 0, bottom: 0, left: 0, right: 0 };
  const fontPreload = props.fontFamily ? (
    <span style={{ fontFamily: props.fontFamily, visibility: "hidden" }}>
      Font preload
    </span>
  ) : null;
  return (
    <div style={style}>
      <div style={style} ref={element} />
      {fontPreload}
    </div>
  );
}
