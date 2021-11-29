import React, { useLayoutEffect } from "react";

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

const getHeight = (parent, selector) => {
  if (parent) {
    const child = parent.querySelector(selector);
    if (child) {
      return child.getBoundingClientRect().height;
    }
  }
  return undefined;
};

/**
 * Computes the number of labels per page to fill the window.
 */
export const useDynamicTableLimit = (element, getRowsPerPage) => {
  // We'll keep the computed number of rows here.
  // The code starts with some reasonable default, performs an initial render
  // with this number of rows to measure row height and then computes the target
  // value based on the row and container dimensions. The extra initial render
  // should not be visible to the user.
  // For now, we only recompute the number of rows per page when table
  // data changes, we don't do it when window size changes.
  const limitStore = store({
    limit: 25
  });

  const rowsPerPage = getRowsPerPage();
  const autoRowsPerPage = rowsPerPage === "auto";
  useLayoutEffect(() => {
    if (!autoRowsPerPage) {
      return;
    }

    const parent = element.current;
    const tableHeight = getHeight(parent, ".Table");
    if (tableHeight) {
      // Take the minimum row height for the calculations. This may
      // occasionally show a scroll slider if some long labels introduce
      // line breaks, but this shouldn't be a problem.
      let minHeight = Number.MAX_VALUE;
      for (let r of parent.querySelectorAll("tr")) {
        minHeight = Math.min(minHeight, r.getBoundingClientRect().height);
      }

      // We need to subtract the table header height.
      const headHeight = getHeight(parent, "thead");

      if (minHeight !== Number.MAX_VALUE) {
        limitStore.limit = Math.floor((tableHeight - headHeight) / minHeight);
      }
    }
  });
  return autoRowsPerPage ? limitStore.limit : rowsPerPage;
};

const cellRenderers = {
  toString: v => `${v}`,
  integer: v => `${v}`,
  float: v => (Number.isFinite(v) ? v.toFixed(2) : "")
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
      for (let i = 0; i < Math.min(spec.rowCount, 50); i++) {
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
    onPageChange,
    onKeyDown
  }) => {
    if (pageCount < 2) {
      return null;
    }

    return (
      <div className="TablePaging" onKeyDown={onKeyDown}>
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
      if (!spec.columns[column].comparator) {
        return;
      }

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
    indices[i] = i;
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

const TableContent = view(({ spec, sort, limit, className }) => {
  const {
    pageCount,
    currentPage,
    first,
    last,
    next,
    prev,
    set,
    start
  } = usePaging(spec, limit);

  const { toggleSort, getSortDirection, indices } = sort;

  const onKeyDown = e => {
    if (e.target.matches("input")) {
      return;
    }
    switch (e.key) {
      case "ArrowLeft":
        if (e.ctrlKey) {
          first();
        } else {
          prev();
        }
        break;

      case "ArrowRight":
        if (e.ctrlKey) {
          last();
        } else {
          next();
        }
        break;
    }
  };

  const end = Math.min(start + limit, spec.rowCount);
  const rows = [];
  for (let i = start; i < end; i++) {
    rows.push(
      <tr key={i}>
        {spec.columns.map((c, j) => {
          return (
            <td key={c.key} className={c.className}>
              {c.render(spec.valueAt(indices[i], j))}
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
        onKeyDown={onKeyDown}
      />

      <div className={classnames("Table", className)}>
        <table tabIndex={0} onKeyDown={onKeyDown}>
          <thead>
            <tr>
              {spec.columns.map((c, i) => {
                return (
                  <th key={c.key} className={c.className}>
                    {c.comparator ? (
                      <ButtonLink onClick={() => toggleSort(i)}>
                        {c.name}
                        <SortIcon direction={getSortDirection(i)} />
                      </ButtonLink>
                    ) : (
                      c.name
                    )}
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

export const Table = view(({ spec, limit, className }) => {
  const resolvedSpec = resolveSpec(spec);
  const sort = useSort(resolvedSpec);

  // Key by spec to drop paging state when the spec changes.
  return (
    <TableContent
      key={spec}
      spec={resolvedSpec}
      sort={sort}
      limit={limit}
      className={className}
    />
  );
});
