import { CSSProperties, useLayoutEffect, useMemo } from "react";
import {
  IDimension,
  IStoryboard,
  useStoryboardStore
} from "./Storyboard.store";
import StoryboardLayoutEngineService from "./StoryboardLayoutEngine.service";
import StoryboardElement from "./StoryboardElement";

interface IStoryboardLayoutEngineProps {
  currentDimension: IDimension;
  storyboard: IStoryboard;
}

const StoryboardLayoutEngine = (props: IStoryboardLayoutEngineProps) => {
  // props
  const {
    currentDimension,
    storyboard: { dimension: targetDimension, elements }
  } = props;

  // state
  const { scaleControls, updateScaleControls } = useStoryboardStore();

  // services
  const storyboardLayoutEngineService = StoryboardLayoutEngineService.getInstance()

  // compute
  const { scaledDimension: storyboardScaledDimension, scaleFactor } = useMemo(
    () =>
      storyboardLayoutEngineService.computeStoryboardScaledDimension({
        targetDimension,
        currentDimension,
        scaleControls
      }),
    [currentDimension, targetDimension, scaleControls]
  );
  const hasScroll =
    storyboardScaledDimension.width > currentDimension.width ||
    storyboardScaledDimension.height > currentDimension.height;

  // effects
  useLayoutEffect(() => {
    if (scaleControls.bestFit && scaleControls.scaleFactor !== scaleFactor)
      updateScaleControls({ bestFit: true, scaleFactor });
  }, [scaleControls, scaleFactor]);

  // styles
  const wrapperStyle: CSSProperties = {
    width: currentDimension.width,
    height: currentDimension.height,
    maxWidth: currentDimension.width,
    maxHeight: currentDimension.height,
    overflow: hasScroll ? "auto" : "hidden"
  };

  // paint
  return (
    <div className="storyboard-layout-wrapper" style={wrapperStyle}>
      <div
        className="storyboard-layout-core-scaled-container"
        style={{ ...storyboardScaledDimension }}
      >
        {elements.map((element) => (
          <StoryboardElement element={element} key={element.elementId} />
        ))}
      </div>
    </div>
  );
};

export default StoryboardLayoutEngine;
