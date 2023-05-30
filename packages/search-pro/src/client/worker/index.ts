import { loadJSONIndex } from "slimsearch";

import database from "@temp/search-pro/index";

import { getResults } from "./result.js";
import { getSuggestions } from "./suggestion.js";
import { IndexField, type IndexItem } from "../../shared/index.js";
import { type MessageData } from "../typings/index.js";

self.onmessage = async ({
  data: { type = "all", query, locale, options },
}: MessageEvent<MessageData>): Promise<void> => {
  const { default: localeIndex } = await database[locale]();

  const searchLocaleIndex = loadJSONIndex<IndexItem, string>(localeIndex, {
    fields: [IndexField.heading, IndexField.text, IndexField.customFields],
    storeFields: [IndexField.heading, IndexField.text, IndexField.customFields],
  });

  if (type === "suggest")
    self.postMessage(getSuggestions(query, searchLocaleIndex, options));
  else if (type === "search")
    self.postMessage(getResults(query, searchLocaleIndex, options));
  else
    self.postMessage({
      suggestions: getSuggestions(query, searchLocaleIndex, options),
      results: getResults(query, searchLocaleIndex, options),
    });
};
