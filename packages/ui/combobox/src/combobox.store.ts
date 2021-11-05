import { UsePopperOptions } from '@udecode/plate-popper';
import { createStore, StateActions, StoreApi } from '@udecode/zustood';
import { Range } from 'slate';
import { NoData, TComboboxItem } from './components';
import { ComboboxOnSelectItem } from './types';

export type ComboboxStateById<TData = NoData> = {
  /**
   * Combobox id.
   */
  id: string;

  /**
   * Items filter function by text.
   * @default (value) => value.text.toLowerCase().startsWith(search.toLowerCase())
   */
  filter?: (search: string) => (item: TComboboxItem<TData>) => boolean;

  /**
   * Max number of items.
   * @default items.length
   */
  maxSuggestions?: number;

  /**
   * Trigger that activates the combobox.
   */
  trigger: string;

  /**
   * Regular expression for search, for example to allow whitespace
   */
  searchPattern?: string;

  /**
   * Called when an item is selected.
   */
  onSelectItem: ComboboxOnSelectItem<TData> | null;

  /**
   * Is opening/closing the combobox controlled by the client.
   */
  controlled?: boolean;
};

export type ComboboxStoreById<TData = NoData> = StoreApi<
  string,
  ComboboxStateById<TData>,
  StateActions<ComboboxStateById<TData>>
>;

export type ComboboxState<TData = NoData> = {
  /**
   * Active id (combobox id which is opened).
   */
  activeId: string | null;

  /**
   * Object whose keys are combobox ids and values are config stores
   * (e.g. one for tag, one for mention,...).
   */
  byId: Record<string, ComboboxStoreById>;

  /**
   * Unfiltered items.
   */
  items: TComboboxItem<TData>[];

  /**
   * Filtered items
   */
  filteredItems: TComboboxItem<TData>[];

  /**
   * Highlighted index.
   */
  highlightedIndex: number;

  /**
   * Parent element of the popper element (the one that has the scroll).
   * @default document
   */
  popperContainer?: Document | HTMLElement;

  /**
   * Overrides `usePopper` options.
   */
  popperOptions?: UsePopperOptions;

  /**
   * Range from the trigger to the cursor.
   */
  targetRange: Range | null;

  /**
   * Text after the trigger.
   */
  text: string | null;
};

const createComboboxStore = (state: ComboboxStateById) =>
  createStore(`combobox-${state.id}`)(state);

export const comboboxStore = createStore('combobox')<ComboboxState>({
  activeId: null,
  byId: {},
  highlightedIndex: 0,
  items: [],
  filteredItems: [],
  targetRange: null,
  text: null,
})
  .extendActions((set, get) => ({
    setComboboxById: <TData = NoData>(state: ComboboxStateById<TData>) => {
      if (get.byId()[state.id]) return;

      set.state((draft) => {
        draft.byId[state.id] = createComboboxStore(
          (state as unknown) as ComboboxStateById
        );
      });
    },
    open: (state: Pick<ComboboxState, 'activeId' | 'targetRange' | 'text'>) => {
      set.mergeState(state);
    },
    reset: () => {
      set.state((draft) => {
        draft.activeId = null;
        draft.highlightedIndex = 0;
        draft.items = [];
        draft.text = null;
        draft.targetRange = null;
      });
    },
  }))
  .extendSelectors((state) => ({
    isOpen: () => !!state.activeId,
  }));

export const getComboboxStoreById = (id: string | null) =>
  id ? comboboxStore.get.byId()[id] : null;

export const useActiveComboboxStore = () => {
  const activeId = comboboxStore.use.activeId();
  const comboboxes = comboboxStore.use.byId();

  return activeId ? comboboxes[activeId] : null;
};