import { CSSProperties, useLayoutEffect, useMemo } from "react";
import {
  IDimension,
  IStoryboard,
  useStoryboardStore
} from "./Storyboard.store";
import StoryboardLayoutEngineService from "./StoryboardLayoutEngine.service";
import StoryboardElement from "./StoryboardElement";

interface IStoryboardLayoutEngineProps {
  targetDimension: IDimension;
  storyboard: IStoryboard;
}

const StoryboardLayoutEngine = (props: IStoryboardLayoutEngineProps) => {
  // props
  const {
    targetDimension,
    storyboard: { dimension: storyboardDimension, elements }
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
        storyboardDimension,
        scaleControls
      }),
    [storyboardDimension, targetDimension, scaleControls]
  );
  const hasScroll =
    storyboardScaledDimension.width > targetDimension.width ||
    storyboardScaledDimension.height > targetDimension.height;

  // effects
  useLayoutEffect(() => {
    if (scaleControls.bestFit && scaleControls.scaleFactor !== scaleFactor)
      updateScaleControls({ bestFit: true, scaleFactor });
  }, [scaleControls, scaleFactor]);

  // styles
  const wrapperStyle: CSSProperties = {
    width: targetDimension.width,
    height: targetDimension.height,
    maxWidth: targetDimension.width,
    maxHeight: targetDimension.height,
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
