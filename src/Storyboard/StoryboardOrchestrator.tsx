import { useState } from "react";
import { IDimension, useStoryboardStore } from "./Storyboard.store";
import StoryboardLayoutEngine from "./StoryboardLayoutEngine";
import StoryboardToolbar from "./StoryboardToolbar";
import ToolbarToggleButton from "./ToolbarToggleButton";
import StoryboardControls from "./StoryboardControls";
import LayoutSettingsSidePanel from "./LayoutSettingsSidePanel";

export default function StoryboardOrchestrator() {
  // state
  const [showToolbar, setShowToolbar] = useState(true);
  const { storyboard, scaleControls, sidePanel } = useStoryboardStore();

  // handlers
  function getToolbarDimension(sidePanelDimension: IDimension): IDimension {
    if (!showToolbar) return { width: 0, height: 0 };
    return { width: visualContainerDimension.width - sidePanelDimension.width, height: 114 };
  }
  function getSidePanelDimension(): IDimension {
    if (!sidePanel) return { width: 0, height: 0 };
    return { width: 250, height: visualContainerDimension.height };
  }

  const toggleToolbar = () => setShowToolbar(!showToolbar);

  // compute
  const ORCHESTRATOR_BORDER_SIZE = 2; // 1 for each side
  const visualContainerDimensionWrapperWidth: IDimension = {
    width: 1030,
    height: 574 + 30
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

  const currentStoryboardContainerDimension: IDimension = {
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
        {showToolbar && <StoryboardToolbar dimension={toolbarDimension} />}
        <ToolbarToggleButton
          toolbarDimension={toolbarDimension}
          sidePanelDimension={sidePanelDimension}
          toggle={toggleToolbar}
        />
        <StoryboardLayoutEngine
          currentDimension={currentStoryboardContainerDimension}
          storyboard={storyboard}
        />
        {sidePanel && <LayoutSettingsSidePanel dimension={sidePanelDimension} />}
        <StoryboardControls dimension={storyboardControlsDimension} />
      </div>
      <div>
        Storyboard Layout Target Dimension -&nbsp;
        {JSON.stringify(storyboard.dimension, null, 2)}
        <br />
        <br />
        Current Container Dimension -&nbsp;
        {JSON.stringify(currentStoryboardContainerDimension, null, 2)}
        <br />
        <br />
        Current Scale factor to fit target inside current container -&nbsp;
        {JSON.stringify(scaleControls, null, 2)}
      </div>
    </>
  );
}
