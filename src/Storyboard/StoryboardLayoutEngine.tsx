import { CSSProperties, useLayoutEffect, useMemo, } from "react";
import {
  IDimension,
  IStoryboard,
  useStoryboardStore
} from "./Storyboard.store";
import StoryboardLayoutEngineService from "./StoryboardLayoutEngine.service";
import StoryboardElement from "./StoryboardElement";
import classNames from "classnames";

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
  const scaleFactor = useMemo(
    () =>
      storyboardLayoutEngineService.findScaleFactorToFitTargetInsideCurrent({
        targetDimension,
        currentDimension,
        scaleControls
      }),
    [currentDimension, targetDimension, scaleControls]
  );

  const hasScroll =
    targetDimension.width * scaleFactor > currentDimension.width ||
    targetDimension.height * scaleFactor > currentDimension.height;

  // effects
  useLayoutEffect(() => {
    if (scaleControls.bestFit && scaleControls.scaleFactor !== scaleFactor) {
      updateScaleControls({ bestFit: true, scaleFactor });
    }

  }, [scaleControls, scaleFactor]);



  // styles
  const wrapperStyle: CSSProperties = {
    width: currentDimension.width,
    height: currentDimension.height,
    maxWidth: currentDimension.width,
    maxHeight: currentDimension.height,
    overflow: hasScroll ? "auto" : "hidden"
  };

  const scaledContainerStyle = { ...targetDimension, '--scale-value': scaleFactor } as CSSProperties

  const scrollSimulatorStyle: CSSProperties = { width: targetDimension.width * scaleFactor, height: targetDimension.height * scaleFactor }

  // paint
  return (
    <div className="storyboard-layout-wrapper" style={wrapperStyle} >
      <div
        className={classNames("storyboard-layout-core-scaled-container-scroll-simulator")}
        style={scrollSimulatorStyle}>
        <div
          className={classNames("storyboard-layout-core-scaled-container")}
          style={scaledContainerStyle}
        >
          {elements.map((element) => (
            <StoryboardElement element={element} key={element.elementId} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryboardLayoutEngine;
