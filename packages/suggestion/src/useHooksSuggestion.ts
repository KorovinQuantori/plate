import React from 'react';

import type {
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common/server';

import { useEditorVersion } from '@udecode/plate-common';

import type { SuggestionPlugin } from './types';

import { findSuggestionNode } from './queries/index';
import { useSetActiveSuggestionId } from './store/useSetActiveSuggestionId';
import { getSuggestionId } from './utils/getSuggestionId';

export const useHooksSuggestion = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  _plugin: WithPlatePlugin<SuggestionPlugin>
) => {
  const version = useEditorVersion();
  const setActiveSuggestionId = useSetActiveSuggestionId();

  /**
   * Set the active suggestion to the selected suggestion (or the first such
   * suggestion if there are multiple). If there is no selected suggestion, set
   * the active suggestion to null.
   */
  React.useEffect(() => {
    if (!editor.selection) return;

    const resetActiveSuggestion = () => {
      setActiveSuggestionId(null);
    };

    const suggestionEntry = findSuggestionNode(editor);

    if (!suggestionEntry) return resetActiveSuggestion();

    const [suggestionNode] = suggestionEntry;

    const id = getSuggestionId(suggestionNode);

    if (!id) return resetActiveSuggestion();

    setActiveSuggestionId(id);
  }, [editor, version, setActiveSuggestionId]);
};
