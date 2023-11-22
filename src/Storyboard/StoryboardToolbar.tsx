import { useRef } from "react";
import { IDimension } from "./Storyboard.store";
import StoryboardLayoutEngineService from "./StoryboardLayoutEngine.service";

const StoryboardToolbar = (props: { dimension: IDimension }) => {
  // props
  const { dimension } = props;

  // ref
  const storyboardLayoutEngineService = useRef(
    StoryboardLayoutEngineService.getInstance()
  ).current;

  // handlers
  const createElement = () => {
    storyboardLayoutEngineService.insertElement();
  };

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
      </div>
    </div>
  );
};

export default StoryboardToolbar;
