import type { Range } from 'slate';

import type { PlateEditor } from '../types/PlateEditor';
import type { TEditableProps } from '../types/slate-react/TEditableProps';

/**
 * @see {@link Decorate} .
 * Optimization: return undefined if empty list so Editable uses a memo.
 */
export const pipeDecorate = (
  editor: PlateEditor,
  decorateProp?: TEditableProps['decorate']
): TEditableProps['decorate'] => {
  const decorates = editor.plugins.flatMap(
    (plugin) => plugin.decorate?.(editor, plugin) ?? []
  );

  if (decorateProp) {
    decorates.push(decorateProp);
  }
  if (decorates.length === 0) return;

  return (entry) => {
    let ranges: Range[] = [];

    const addRanges = (newRanges?: Range[]) => {
      if (newRanges?.length) ranges = [...ranges, ...newRanges];
    };

    decorates.forEach((decorate) => {
      addRanges(decorate(entry));
    });

    return ranges;
  };
};
