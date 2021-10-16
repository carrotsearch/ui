import React from "react";

import classnames from "classnames";

import { store, view } from "@risingstack/react-easy-state";

import { ButtonLink } from "./ButtonLink.js";

import { Button, InputGroup } from "@blueprintjs/core";

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

const PagingButton = ({ icon, onClick }) => {
  return (
    <Button minimal={true} small={true} onClick={onClick}>
      <FontAwesomeIcon icon={icon} />
    </Button>
  );
};

const IntegerInput = view(({ initial, onChange }) => {
  const state = store({
    value: `${initial}`
  });
  const commitValue = () => {
    const val = state.value;
    const parsed = parseInt(val);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };
  return (
    <InputGroup
      small={false}
      value={state.value}
      onChange={e => (state.value = e.target.value)}
      onKeyUp={e => {
        if (e.key === "Enter") {
          commitValue(e);
        }
      }}
      onBlur={commitValue}
    />
  );
});

export const TablePaging = view(
  ({
    currentPage,
    pageCount,
    onFirst,
    onPrev,
    onNext,
    onLast,
    onPageChange
  }) => {
    if (pageCount < 2) {
      return null;
    }

    return (
      <div className="TablePaging">
        <PagingButton onClick={onFirst} icon={faChevronDoubleLeft} />
        <PagingButton onClick={onPrev} icon={faChevronLeft} />
        <span>
          page
          <IntegerInput
            key={currentPage}
            initial={currentPage}
            onChange={onPageChange}
          />
          of
          <strong>{pageCount}</strong>
        </span>
        <PagingButton onClick={onNext} icon={faChevronRight} />
        <PagingButton onClick={onLast} icon={faChevronDoubleRight} />
      </div>
    );
  }
);

const useSort = spec => {
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
  const toggleSort = sortStore.toggle;
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
        spec.valueAt(a, sortColumn),
        spec.valueAt(b, sortColumn)
      );
    });
  }

  const getSortDirection = columnIndex => {
    return columnIndex === sortColumn ? sortDirection : undefined;
  };

  return { toggleSort, getSortDirection, indices };
};

const usePaging = (spec, limit) => {
  const paging = store({
    current: 1
  });

  const rowCount = spec.rowCount;
  const pageCount = Math.ceil(rowCount / limit);
  const maxPage = pageCount;

  const currentPage = paging.current;
  const start = limit * (currentPage - 1);

  return {
    currentPage,
    pageCount,
    start,
    next: () => (paging.current = Math.min(maxPage, currentPage + 1)),
    prev: () => (paging.current = Math.max(1, currentPage - 1)),
    first: () => (paging.current = 1),
    last: () => (paging.current = maxPage),
    set: p => (paging.current = Math.min(maxPage, Math.max(1, p)))
  };
};

export const Table = view(({ spec, limit, className }) => {
  const resolvedSpec = resolveSpec(spec);

  const { toggleSort, getSortDirection, indices } = useSort(resolvedSpec);
  const { pageCount, currentPage, first, last, next, prev, set, start } =
    usePaging(resolvedSpec, limit);

  const end = Math.min(start + limit, resolvedSpec.rowCount);
  const rows = [];
  for (let i = start; i < end; i++) {
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
    <>
      <TablePaging
        pageCount={pageCount}
        currentPage={currentPage}
        onFirst={first}
        onPrev={prev}
        onNext={next}
        onLast={last}
        onPageChange={set}
      />

      <div className={classnames("Table", className)}>
        <table>
          <thead>
            <tr>
              {resolvedSpec.columns.map((c, i) => {
                return (
                  <th key={c.key} className={c.className}>
                    <ButtonLink onClick={() => toggleSort(i)}>
                      {c.name}
                      <SortIcon direction={getSortDirection(i)} />
                    </ButtonLink>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>{rows}</tbody>
        </table>
      </div>
    </>
  );
});
