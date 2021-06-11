import React from "react";

import fuzzysort from "fuzzysort";

export const getSearchHighlightHtml = (search, text, target) => {
  if (search && target) {
    const result = checkSearchMatch(search, target);
    if (result) {
      return fuzzysort.highlight(result, "<b class='hl'>", "</b>");
    }
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
  elementType = "span"
}) => {
  return React.createElement(elementType, {
    dangerouslySetInnerHTML: {
      __html: getSearchHighlightHtml(search, text, target)
    }
  });
};
