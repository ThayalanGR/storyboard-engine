import { useCallback, } from "react";
import { IDimension, useStoryboardStore } from "./Storyboard.store";
import StoryboardLayoutEngineService from "./StoryboardLayoutEngine.service";

const StoryboardToolbar = (props: { dimension: IDimension }) => {
  // props
  const { dimension } = props;

  // state
  const { activeElementId, sidePanel, toggleSidePanel } = useStoryboardStore(({ activeElementId, sidePanel, toggleSidePanel }) => ({ activeElementId, sidePanel, toggleSidePanel }))

  // services
  const storyboardLayoutEngineService = StoryboardLayoutEngineService.getInstance()

  // compute
  const hasActiveElement = activeElementId !== null

  // handlers
  const createElement = () => {
    storyboardLayoutEngineService.insertElement();
  };

  const deleteElement = () => {
    if (hasActiveElement)
      storyboardLayoutEngineService.deleteElement(activeElementId);
  }

  const openDummySidePanel = () => {
    toggleSidePanel(!sidePanel)
  }

  // paint
  return (
    <div className="storyboard-toolbar" style={{ ...dimension }}>
      <h4>Toolbar</h4>
      <div className="toolbar-action-items">
        <div
          className="toolbar-action-item"
          role="button"
          onClick={createElement}
        >
          Insert Element
        </div>
        {hasActiveElement &&
          <div
            className="toolbar-action-item toolbar-action-item-delete-element"
            role="button"
            onClick={deleteElement}
          >
            Delete Element
          </div>
        }
        <div
          className="toolbar-action-item"
          role="button"
          onClick={openDummySidePanel}
          style={{ marginLeft: 'auto', marginRight: 40 }}
        >
          {sidePanel ? 'Close' : 'Open'} Dummy side Panel
        </div>
      </div>
    </div>
  );
};

export default StoryboardToolbar;
