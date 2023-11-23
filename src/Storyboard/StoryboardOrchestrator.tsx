import { useState } from "react";
import { IDimension, useStoryboardStore } from "./Storyboard.store";
import StoryboardLayoutEngine from "./StoryboardLayoutEngine";
import StoryboardToolbar from "./StoryboardToolbar";
import ToolbarToggleButton from "./ToolbarToggleButton";
import StoryboardControls from "./StoryboardControls";
import DummySidePanel from "./DummySidePanel";

export default function StoryboardOrchestrator() {
  // state
  const [showToolbar, setShowToolbar] = useState(true);
  const { storyboard, sidePanel } = useStoryboardStore();

  // handlers
  function getToolbarDimension(sidePanelDimension: IDimension): IDimension {
    if (!showToolbar) return { width: 0, height: 0 };
    return { width: visualContainerDimension.width - sidePanelDimension.width, height: 100 };
  }
  function getSidePanelDimension(): IDimension {
    if (!sidePanel) return { width: 0, height: 0 };
    return { width: 250, height: visualContainerDimension.height };
  }

  const toggleToolbar = () => setShowToolbar(!showToolbar);

  // compute
  const ORCHESTRATOR_BORDER_SIZE = 2; // 1 for each side
  const visualContainerDimensionWrapperWidth: IDimension = {
    width: 1280,
    height: 720
  };
  const visualContainerDimension: IDimension = {
    width: visualContainerDimensionWrapperWidth.width - ORCHESTRATOR_BORDER_SIZE,
    height: visualContainerDimensionWrapperWidth.height - ORCHESTRATOR_BORDER_SIZE
  };
  const sidePanelDimension = getSidePanelDimension();
  const toolbarDimension = getToolbarDimension(sidePanelDimension);
  const storyboardControlsDimension: IDimension = {
    width: visualContainerDimension.width - sidePanelDimension.width,
    height: 30
  };

  const storyboardTargetDimension: IDimension = {
    width: visualContainerDimension.width - sidePanelDimension.width,
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
        style={{ ...visualContainerDimensionWrapperWidth }}
      >
        <StoryboardToolbar dimension={toolbarDimension} />
        <ToolbarToggleButton
          toolbarDimension={toolbarDimension}
          sidePanelDimension={sidePanelDimension}
          toggle={toggleToolbar}
        />
        <StoryboardLayoutEngine
          targetDimension={storyboardTargetDimension}
          storyboard={storyboard}
        />
        {sidePanel && <DummySidePanel dimension={sidePanelDimension} />}
        <StoryboardControls dimension={storyboardControlsDimension} />
      </div>
      <div>
        Storyboard layout root dimension -&nbsp;
        {JSON.stringify(storyboard.dimension, null, 2)}
      </div>
    </>
  );
}
