import type { TextUnit } from 'slate';

import {
  type PlateEditor,
  type Value,
  getAboveNode,
  getNodeString,
  isCollapsed,
  isDefined,
} from '@udecode/plate-common/server';

import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { outdentList } from '../transforms';

export const deleteBackwardIndentList = <V extends Value>(
  editor: PlateEditor<V>
) => {
  const { deleteBackward } = editor;

  return function (unit: TextUnit) {
    const nodeEntry = getAboveNode(editor);

    if (!nodeEntry) return deleteBackward(unit);

    const listNode = nodeEntry[0];

    if (isCollapsed(editor.selection) && getNodeString(listNode))
      return deleteBackward(unit);
    if (isDefined(listNode[KEY_LIST_STYLE_TYPE])) {
      return outdentList(editor);
    }

    return deleteBackward(unit);
  };
};
