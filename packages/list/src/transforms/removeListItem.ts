import {
  type PlateEditor,
  type TElement,
  type TElementEntry,
  type Value,
  createPathRef,
  deleteMerge,
  getNodeEntry,
  getPluginType,
  getPreviousPath,
  insertElements,
  isExpanded,
  removeNodes,
  withoutNormalizing,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import { ELEMENT_LI, ELEMENT_LIC } from '../createListPlugin';
import { hasListChild } from '../queries/hasListChild';
import { moveListItemSublistItemsToListItemSublist } from './moveListItemSublistItemsToListItemSublist';
import { moveListItemsToList } from './moveListItemsToList';

export interface RemoveListItemOptions {
  list: TElementEntry;
  listItem: TElementEntry;
  reverse?: boolean;
}

/** Remove list item and move its sublist to list if any. */
export const removeListItem = <V extends Value>(
  editor: PlateEditor<V>,
  { list, listItem, reverse = true }: RemoveListItemOptions
) => {
  const [liNode, liPath] = listItem;

  // Stop if the list item has no sublist
  if (isExpanded(editor.selection) || !hasListChild(editor, liNode)) {
    return false;
  }

  const previousLiPath = getPreviousPath(liPath);

  let success = false;

  withoutNormalizing(editor, () => {
    /**
     * If there is a previous li, we need to move sub-lis to the previous li. As
     * we need to delete first, we will:
     *
     * 1. Insert a temporary li: tempLi
     * 2. Move sub-lis to tempLi
     * 3. Delete
     * 4. Move sub-lis from tempLi to the previous li.
     * 5. Remove tempLi
     */
    if (previousLiPath) {
      const previousLi = getNodeEntry<TElement>(editor, previousLiPath);

      if (!previousLi) return;

      // 1
      let tempLiPath = Path.next(liPath);
      insertElements(
        editor,
        {
          children: [
            {
              children: [{ text: '' }],
              type: getPluginType(editor, ELEMENT_LIC),
            },
          ],
          type: getPluginType(editor, ELEMENT_LI),
        },
        { at: tempLiPath }
      );

      const tempLi = getNodeEntry<TElement>(editor, tempLiPath);

      if (!tempLi) return;

      const tempLiPathRef = createPathRef(editor, tempLi[1]);

      // 2
      moveListItemSublistItemsToListItemSublist(editor, {
        fromListItem: listItem,
        toListItem: tempLi,
      });

      // 3
      deleteMerge(editor, {
        reverse,
      });

      tempLiPath = tempLiPathRef.unref()!;

      // 4
      moveListItemSublistItemsToListItemSublist(editor, {
        fromListItem: [tempLi[0], tempLiPath],
        toListItem: previousLi,
      });

      // 5
      removeNodes(editor, { at: tempLiPath });

      success = true;

      return;
    }

    // If it's the first li, move the sublist to the parent list
    moveListItemsToList(editor, {
      fromListItem: listItem,
      toList: list,
      toListIndex: 1,
    });
  });

  return success;
};
