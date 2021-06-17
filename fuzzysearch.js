import React from "react";

import fuzzysort from "fuzzysort";

export const getSearchHighlightHtml = (search, text, target) => {
  if (search && target) {
    return getSearchHighlightHtmlForResult(
      checkSearchMatch(search, target),
      text
    );
  }
  return text;
};

const getSearchHighlightHtmlForResult = (result, text) => {
  if (result) {
    return fuzzysort.highlight(result, "<b class='hl'>", "</b>");
  }
  return text;
};

export const checkSearchMatch = (search, string) => {
  const result = fuzzysort.single(search, string, {
    allowTypo: false
  });
  return result !== null && result.score >= -1000 ? result : null;
};

export const prepareSearchTarget = text => fuzzysort.prepareSlow(text);

export const SearchHighlight = ({
  text,
  target,
  search,
  elementType = "span",
  result
}) => {
  return React.createElement(elementType, {
    dangerouslySetInnerHTML: {
      __html: result
        ? getSearchHighlightHtmlForResult(result, text)
        : getSearchHighlightHtml(search, text, target)
    }
  });
};
