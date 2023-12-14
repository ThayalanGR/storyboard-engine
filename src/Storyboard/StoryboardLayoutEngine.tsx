import { CSSProperties, useLayoutEffect, useMemo, useRef } from "react";
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

  // refs
  const wrapperRef = useRef<HTMLDivElement>(null)

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

  // handlers
  const resetWrapperScroll = () => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTo({ top: 0, left: 0 })
    }
  }

  // effects
  useLayoutEffect(() => {
    if (scaleControls.bestFit && scaleControls.scaleFactor !== scaleFactor) {
      updateScaleControls({ bestFit: true, scaleFactor });
    }

    if (!hasScroll)
      resetWrapperScroll()

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
    <div ref={wrapperRef} className="storyboard-layout-wrapper" style={wrapperStyle} >
      <div
        className={classNames("storyboard-layout-core-scaled-container", { 'storyboard-layout-core-scaled-container-without-scroll': !hasScroll })}
        style={{ ...targetDimension, '--scale-value': scaleFactor } as CSSProperties}
      >
        {elements.map((element) => (
          <StoryboardElement element={element} key={element.elementId} />
        ))}
      </div>
      <div style={{ width: targetDimension.width * scaleFactor, height: targetDimension.height * scaleFactor }}></div>
    </div>
  );
};

export default StoryboardLayoutEngine;
