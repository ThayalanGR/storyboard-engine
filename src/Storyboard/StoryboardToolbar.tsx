import { useCallback, } from "react";
import { IDimension, useStoryboardStore } from "./Storyboard.store";
import StoryboardLayoutEngineService from "./StoryboardLayoutEngine.service";

const StoryboardToolbar = (props: { dimension: IDimension }) => {
  // props
  const { dimension } = props;

  // state
  const { activeElementId, updateActiveElementId } = useStoryboardStore(({ activeElementId, updateActiveElementId }) => ({ activeElementId, updateActiveElementId }))

  // services
  const storyboardLayoutEngineService = StoryboardLayoutEngineService.getInstance()

  // compute
  const hasActiveElement = activeElementId !== null

  // handlers
  const createElement = () => {
    storyboardLayoutEngineService.insertElement();
  };

  const deleteElement = useCallback(() => {
    if (hasActiveElement) {
      storyboardLayoutEngineService.deleteElement(activeElementId);
      updateActiveElementId(null)
    }
  }, [hasActiveElement, activeElementId, updateActiveElementId]);

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
      </div>
    </div>
  );
};

export default StoryboardToolbar;
