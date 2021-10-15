import React from "react";

import { view, store } from "@risingstack/react-easy-state";

import { ButtonLink } from "./ButtonLink.js";

import { InputGroup, Button } from "@blueprintjs/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretUp,
  faChevronDoubleLeft,
  faChevronDoubleRight,
  faChevronLeft,
  faChevronRight
} from "@fortawesome/pro-regular-svg-icons";

import { reversedComparator } from "./lang/comparator.js";
import { insertZWSPAtCamelCase } from "./lang/strings.js";

import "./Table.css";

const cellRenderers = {
  toString: v => `${v}`,
  integer: v => `${v}`,
  float: v => v.toFixed(2)
};

const resolveSpec = spec => {
  return resolveCellRenderers(insertZWSP(spec));
};

const insertZWSP = spec => {
  spec.columns.forEach(c => {
    if (c.name) {
      c.name = insertZWSPAtCamelCase(c.name);
    }
  });
  return spec;
};

const resolveCellRenderers = spec => {
  spec.columns.forEach((c, j) => {
    if (c.render === "auto") {
      let renderer = cellRenderers.integer;
      let type = "int";
      for (let i = 0; i < Math.min(spec.rowCount, 10); i++) {
        const v = spec.valueAt(i, j);
        if (Number.isFinite(v)) {
          if (!Number.isInteger(v)) {
            renderer = cellRenderers.float;
            type = "float";
          }
        } else {
          renderer = cellRenderers.toString;
          type = "string";
          break;
        }
      }
      c.render = renderer;
      c.type = type;
    }
  });
  return spec;
};

const SortIcon = ({ direction }) => {
  if (!direction) {
    return null;
  }

  let icon;
  if (direction === "asc") {
    icon = faCaretUp;
  } else {
    icon = faCaretDown;
  }
  return <FontAwesomeIcon className="SortIcon" icon={icon} />;
};

const PagingButton = ({ icon }) => {
  return (
    <Button minimal={true} small={true}>
      <FontAwesomeIcon icon={icon} />
    </Button>
  );
};

export const TablePaging = view(({ rowCount, limit, onPageChange }) => {
  return (
    <div className="TablePaging">
      <PagingButton icon={faChevronDoubleLeft} />
      <PagingButton icon={faChevronLeft} />
      <span>
        page
        <InputGroup small={false} />
        of 10
      </span>
      <PagingButton icon={faChevronRight} />
      <PagingButton icon={faChevronDoubleRight} />
    </div>
  );
});

export const Table = view(({ spec, limit }) => {
  const resolvedSpec = resolveSpec(spec);

  const initialSortColumn = spec.columns.find(c => c.sort && c.sort !== "none");
  const sortStore = store({
    column: initialSortColumn
      ? spec.columns.findIndex(c => c === initialSortColumn)
      : -1,
    direction: initialSortColumn?.sort,
    toggle: column => {
      if (column !== sortStore.column) {
        sortStore.column = column;
        sortStore.direction = "desc";
      } else {
        sortStore.direction = sortStore.direction === "desc" ? "asc" : "desc";
      }
    }
  });
  const sortColumn = sortStore.column;
  const sortDirection = sortStore.direction;

  // Sort the data
  const rowCount = spec.rowCount;
  let indices = new Array(rowCount);
  for (let i = 0; i < rowCount; i++) {
    indices.push(i);
  }
  if (sortColumn >= 0) {
    let comparator = spec.columns[sortColumn].comparator;
    if (sortDirection === "desc") {
      comparator = reversedComparator(comparator);
    }
    indices.sort((a, b) => {
      return comparator(
        resolvedSpec.valueAt(a, sortColumn),
        resolvedSpec.valueAt(b, sortColumn)
      );
    });
  }

  const count = Math.min(limit, resolvedSpec.rowCount);
  const rows = [];
  for (let i = 0; i < count; i++) {
    rows.push(
      <tr key={i}>
        {resolvedSpec.columns.map((c, j) => {
          return (
            <td key={c.key} className={c.className}>
              {c.render(resolvedSpec.valueAt(indices[i], j))}
            </td>
          );
        })}
      </tr>
    );
  }

  return (
    <table className="Table">
      <thead>
        <tr>
          {resolvedSpec.columns.map((c, i) => {
            return (
              <th key={c.key} className={c.className}>
                <ButtonLink onClick={() => sortStore.toggle(i)}>
                  {c.name}
                  {i === sortColumn ? (
                    <SortIcon direction={sortDirection} />
                  ) : null}
                </ButtonLink>
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>{rows}</tbody>
    </table>
  );
});
