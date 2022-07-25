import React, { Fragment, useLayoutEffect } from "react";

import classnames from "classnames";

import { store, view } from "@risingstack/react-easy-state";

import { ButtonLink } from "./ButtonLink.js";

import { Button, InputGroup } from "@blueprintjs/core";

import {
  VscChevronLeft,
  VscChevronRight,
  VscFoldDown,
  VscArrowSmallUp,
  VscArrowSmallDown
} from "react-icons/vsc";

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
export const useDynamicTableLimit = (
  element,
  getRowsPerPage,
  initialLimit = 25
) => {
  // We'll keep the computed number of rows here.
  // The code starts with some reasonable default, performs an initial render
  // with this number of rows to measure row height and then computes the target
  // value based on the row and container dimensions. The extra initial render
  // should not be visible to the user.
  // For now, we only recompute the number of rows per page when table
  // data changes, we don't do it when window size changes.
  const limitStore = store({
    limit: initialLimit,
    limitComputed: false
  });

  const rowsPerPage = getRowsPerPage();
  const autoRowsPerPage = rowsPerPage === "auto";
  useLayoutEffect(() => {
    if (!autoRowsPerPage || limitStore.limitComputed) {
      return;
    }

    const parent = element.current;
    const tableHeight = getHeight(parent, ".Table");
    if (tableHeight) {
      // Take the minimum row height for the calculations. This may
      // occasionally show a scroll slider if some long labels introduce
      // line breaks, but this shouldn't be a problem.
      let minHeight = Number.MAX_VALUE;
      for (let r of parent.querySelectorAll("tbody tr")) {
        minHeight = Math.min(minHeight, r.getBoundingClientRect().height);
      }

      // We need to subtract the table header height.
      const headHeight = getHeight(parent, "thead");

      if (minHeight !== Number.MAX_VALUE) {
        limitStore.limit = Math.floor((tableHeight - headHeight) / minHeight);
        limitStore.limitComputed = true;
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

/**
 * Preprocesses column names for better display, infers column data types,
 * resolves default renderers. Call this method before passing the table
 * spec for React or Excel rendering.
 */
export const prepareTableSpec = spec => {
  if (!spec.$prepared) {
    insertZWSPInColumnNames(spec);
    inferColumnTypes(spec);
    resolveCellRenderers(spec);
    spec.$prepared = true;
  }
  return spec;
};

const insertZWSPInColumnNames = spec => {
  spec.columns.forEach(c => {
    if (c.name) {
      c.name = insertZWSPAtCamelCase(c.name);
    }
  });
  return spec;
};

const resolveCellRenderers = spec => {
  spec.columns.forEach((c, j) => {
    if (!c.render || c.render === "auto") {
      let renderer;
      switch (c.$type) {
        case "int":
          renderer = cellRenderers.integer;
          break;

        case "float":
          renderer = cellRenderers.float;
          break;

        case "string":
        default:
          renderer = cellRenderers.toString;
          break;
      }
      c.render = renderer;
    }
  });
  return spec;
};

const inferColumnTypes = spec => {
  spec.columns.forEach(column => {
    if (column.$type) {
      return;
    }

    let type = "int";
    for (let i = 0; i < Math.min(spec.rowCount, 50); i++) {
      const v = column.value(i);
      if (Number.isFinite(v)) {
        if (!Number.isInteger(v)) {
          type = "float";
          break;
        }
      } else {
        type = "string";
        break;
      }
    }

    column.$type = type;
  });
};

const SortIcon = ({ direction }) => {
  if (!direction) {
    return null;
  }
  return direction === "asc" ? <VscArrowSmallUp /> : <VscArrowSmallDown />;
};

const PagingButton = ({ icon, onClick }) => {
  return (
    <Button minimal={true} small={true} onClick={onClick}>
      {icon}
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
        <PagingButton
          onClick={onFirst}
          icon={<VscFoldDown className="DoubleChevronLeft" />}
        />
        <PagingButton
          onClick={onPrev}
          icon={<VscChevronLeft className="SingleChevron" size="1.3em" />}
        />
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
        <PagingButton
          onClick={onNext}
          icon={<VscChevronRight className="SingleChevron" size="1.3em" />}
        />
        <PagingButton
          onClick={onLast}
          icon={<VscFoldDown className="DoubleChevronRight" />}
        />
      </div>
    );
  }
);

const useSort = spec => {
  const initialSortColumn = spec.columns.find(
    c => c.comparator && c.initialSortOrder
  );
  const sortStore = store({
    // Use column key in the store rather than column instance.
    // We don't reset sort hook state on spec changes, so if we
    // kept instances, we'd be using stale column reference after
    // a spec change.
    columnKey: initialSortColumn?.key,
    direction: initialSortColumn?.initialSortOrder,
    toggle: columnSpec => {
      if (!columnSpec.comparator) {
        return;
      }

      if (!sortStore.columnKey || columnSpec.key !== sortStore.columnKey) {
        sortStore.columnKey = columnSpec.key;
        sortStore.direction = columnSpec.initialSortDirection || "asc";
      } else {
        sortStore.direction = sortStore.direction === "desc" ? "asc" : "desc";
      }
    }
  });
  const toggleSort = sortStore.toggle;
  const sortColumn =
    spec.columns.find(c => c.key === sortStore.columnKey) || initialSortColumn;
  const sortDirection = sortStore.direction;

  // Sort the data
  const rowCount = spec.rowCount;
  let indices = new Array(rowCount);
  for (let i = 0; i < rowCount; i++) {
    indices[i] = i;
  }
  if (sortColumn) {
    let comparator = sortColumn.comparator;
    if (sortDirection === "desc") {
      comparator = reversedComparator(comparator);
    }
    indices.sort((a, b) => {
      return comparator(sortColumn.value(a), sortColumn.value(b));
    });
  }

  const getSortDirection = columnSpec => {
    return columnSpec?.key === sortColumn?.key ? sortDirection : undefined;
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

const DefaultColumnGroupCell = ({ rowIndex, columns }) => {
  return (
    <>
      {columns.map(column => {
        if (!column) {
          throw "Unknown column key: " + key;
        }

        const rendered = column.render(column.value(rowIndex), columns);
        if (columns.length > 1) {
          return (
            <div key={column.key} className="CellGroupMember">
              {rendered}
            </div>
          );
        } else {
          return <Fragment key={column.key}>{rendered}</Fragment>;
        }
      })}
    </>
  );
};

const ColumnHeader = ({ column, sortDirection, toggleSort }) => {
  if (column.comparator) {
    return (
      <ButtonLink onClick={() => toggleSort(column)} title={column.title}>
        {column.name}
        <SortIcon direction={sortDirection} />
      </ButtonLink>
    );
  } else {
    return <span title={column.title}>{column.name}</span>;
  }
};

const TableContent = view(
  ({
    spec,
    sort,
    limit,
    className,
    initialSelectionIndex,
    onSelectionChanged
  }) => {
    const { pageCount, currentPage, first, last, next, prev, set, start } =
      usePaging(spec, limit);

    const { toggleSort, getSortDirection, indices } = sort;

    const selectionEnabled = !!onSelectionChanged;
    const selection = store({
      index: initialSelectionIndex
    });

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

    const columnGroups =
      spec.columnGroups || spec.columns.map(c => ({ columns: [c] }));

    const end = Math.min(start + limit, spec.rowCount);
    const rows = [];
    for (let i = start; i < end; i++) {
      const onRowClick = selectionEnabled
        ? () => {
            selection.index = i;
            return onSelectionChanged(i);
          }
        : undefined;

      rows.push(
        <tr
          key={i}
          onClick={onRowClick}
          className={selection.index === i ? "Selected" : null}
        >
          {columnGroups.map(({ columns, render, className }) => {
            const rowIndex = indices[i];
            const columnGroupClassName = className || columns[0].className;
            return (
              <td
                key={columns.map(c => c.key).join("/")}
                className={columnGroupClassName}
              >
                {render ? (
                  render(
                    columns.map(column => column.value(rowIndex)),
                    columns
                  )
                ) : (
                  <DefaultColumnGroupCell
                    columns={columns}
                    rowIndex={rowIndex}
                  />
                )}
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

        <div
          className={classnames("Table", className, {
            SelectionEnabled: selectionEnabled
          })}
        >
          <table tabIndex={0} onKeyDown={onKeyDown}>
            <thead>
              <tr>
                {columnGroups.map(({ columns, name, className }) => {
                  const columnGroupClassName =
                    className || columns[0].className;

                  return (
                    <th
                      key={columns.map(c => c.key).join("/")}
                      className={classnames(columnGroupClassName)}
                    >
                      {name ||
                        columns.map(c => {
                          return (
                            <ColumnHeader
                              key={c.key}
                              column={c}
                              sortDirection={getSortDirection(c)}
                              toggleSort={toggleSort}
                            />
                          );
                        })}
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
  }
);

export const Table = view(
  ({ spec, limit, className, initialSelectionIndex, onSelectionChanged }) => {
    const resolvedSpec = prepareTableSpec(spec);
    const sort = useSort(resolvedSpec);

    // Key by spec to drop paging state when the spec changes.
    return (
      <TableContent
        key={spec}
        spec={resolvedSpec}
        sort={sort}
        limit={limit}
        className={className}
        initialSelectionIndex={initialSelectionIndex}
        onSelectionChanged={onSelectionChanged}
      />
    );
  }
);
