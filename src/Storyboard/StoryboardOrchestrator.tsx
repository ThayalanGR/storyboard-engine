import { useState } from "react";
import { IDimension, useStoryboardStore } from "./Storyboard.store";
import StoryboardLayoutEngine from "./StoryboardLayoutEngine";
import StoryboardToolbar from "./StoryboardToolbar";
import ToolbarToggleButton from "./ToolbarToggleButton";
import StoryboardControls from "./StoryboardControls";

export default function StoryboardOrchestrator() {
  // state
  const [showToolbar, setShowToolbar] = useState(true);
  const { storyboard } = useStoryboardStore();

  // handlers
  function getToolbarDimension(): IDimension {
    if (!showToolbar) return { width: 0, height: 0 };
    return { width: visualContainerDimension.width, height: 100 };
  }

  const toggleToolbar = () => setShowToolbar(!showToolbar);

  // compute
  const visualContainerDimension: IDimension = {
    width: 1280,
    height: 720
  };
  const toolbarDimension = getToolbarDimension();
  const storyboardControlsDimension: IDimension = {
    width: visualContainerDimension.width,
    height: 30
  };

  const storyboardTargetDimension: IDimension = {
    width: visualContainerDimension.width,
    height:
      visualContainerDimension.height -
      toolbarDimension.height -
      storyboardControlsDimension.height
  };

  // paint
  return (
    <>
      <div
        className="storyboard-orchestrator"
        style={{ ...visualContainerDimension }}
      >
        {showToolbar && <StoryboardToolbar dimension={toolbarDimension} />}
        <ToolbarToggleButton
          toolbarDimension={toolbarDimension}
          toggle={toggleToolbar}
        />
        <StoryboardLayoutEngine
          targetDimension={storyboardTargetDimension}
          storyboard={storyboard}
        />
        <StoryboardControls dimension={storyboardControlsDimension} />
      </div>
      <div>
        Storyboard layout root dimension -&nbsp;
        {JSON.stringify(storyboard.dimension, null, 2)}
      </div>
    </>
  );
}
