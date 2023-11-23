import React, { CSSProperties, useCallback, useRef } from "react";
import classnames from "classnames";
import { useStoryboardStore, STORYBOARD_CONSTANTS } from "./Storyboard.store";
import StoryboardLayoutEngineService from "./StoryboardLayoutEngine.service";

export default function StoryboardScaleControls() {
  // state
  const { scaleControls, updateScaleControls } = useStoryboardStore();

  // services
  const storyboardLayoutEngineService = StoryboardLayoutEngineService.getInstance();

  // refs
  const progressHeadRef = useRef<HTMLDivElement>(null)
  const sliderTrackRef = useRef<HTMLDivElement>(null)

  // handlers
  const onScaleChange = (scaleValue: number) =>
    updateScaleControls({
      ...scaleControls,
      scaleFactor: storyboardLayoutEngineService.roundToDecimal(
        storyboardLayoutEngineService.getClampedNumber(
          scaleValue,
          STORYBOARD_CONSTANTS.STORYBOARD_SCALE_MIN_MAX.MIN,
          STORYBOARD_CONSTANTS.STORYBOARD_SCALE_MIN_MAX.MAX
        )
      ),
      bestFit: false
    });

  const onScaleStepIncrease = () => onScaleChange(scaleControls.scaleFactor + 0.1);

  const onScaleStepDecrease = () => onScaleChange(scaleControls.scaleFactor - 0.1);

  const onBestFitClick = () =>
    updateScaleControls({
      ...scaleControls,
      bestFit: true
    });

  // progress head slide
  const getProgressSlidePercentage = (e: React.MouseEvent<HTMLDivElement>) => {
    const parentElementBoundingRect = sliderTrackRef.current?.getBoundingClientRect();
    const progressedWidth = e.clientX - (parentElementBoundingRect?.left ?? 0);
    const progressWidth = parentElementBoundingRect?.width ?? 0;

    const newPercentage = storyboardLayoutEngineService.calculatePercentage(
      progressedWidth,
      progressWidth
    );
    const minPercentage = storyboardLayoutEngineService.calculatePercentage(
      STORYBOARD_CONSTANTS.STORYBOARD_SCALE_MIN_MAX.MIN,
      STORYBOARD_CONSTANTS.STORYBOARD_SCALE_MIN_MAX.UPPER_MAX
    );
    const maxPercentage = storyboardLayoutEngineService.calculatePercentage(
      STORYBOARD_CONSTANTS.STORYBOARD_SCALE_MIN_MAX.MAX,
      STORYBOARD_CONSTANTS.STORYBOARD_SCALE_MIN_MAX.UPPER_MAX
    );
    const clampedPercentage = storyboardLayoutEngineService.roundToDecimal(
      storyboardLayoutEngineService.getClampedNumber(
        newPercentage,
        minPercentage,
        maxPercentage
      )
    );
    return clampedPercentage;
  };

  const onProgressHeadSlide = useCallback(
    (newProgress: number) => {
      if (progressHeadRef.current)
        progressHeadRef.current.style.left = `${newProgress - STORYBOARD_CONSTANTS.SLIDER_HEAD_DIMENSION.WIDTH / 2}%`;
      // find and update the scale factor
      const newScaleFactor = storyboardLayoutEngineService.roundToDecimal(
        storyboardLayoutEngineService.calculateValueFromPercentage(
          newProgress,
          STORYBOARD_CONSTANTS.STORYBOARD_SCALE_MIN_MAX.UPPER_MAX * 100
        ) / 100 // / by 100 to make the percentage into decimal
      );
      onScaleChange(newScaleFactor);
    },
    [progressHeadRef]
  );

  const onHeadMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const newPercentage = getProgressSlidePercentage(event);
      onProgressHeadSlide(newPercentage);

      // Add mousemove and mouseup event listeners to the document
      document.addEventListener("mousemove", onHeadMouseMove);
      document.addEventListener("mouseup", onHeadMouseUp);
    },
    []
  );

  const onHeadMouseMove = useCallback((event: MouseEvent) => {
    if (event.clientX <= 0) return;
    const newPercentage = getProgressSlidePercentage(event as unknown as React.MouseEvent<HTMLDivElement>);
    onProgressHeadSlide(newPercentage);
  }, []);

  const onHeadMouseUp = useCallback(() => {
    // Remove the mousemove and mouseup event listeners from the document
    document.removeEventListener("mousemove", onHeadMouseMove);
    document.removeEventListener("mouseup", onHeadMouseUp);
  }, [onHeadMouseMove]);

  // compute
  const hasScaleIncrease =
    scaleControls.scaleFactor <
    STORYBOARD_CONSTANTS.STORYBOARD_SCALE_MIN_MAX.MAX;
  const hasScaleDecrease =
    scaleControls.scaleFactor >
    STORYBOARD_CONSTANTS.STORYBOARD_SCALE_MIN_MAX.MIN;
  const sliderPercentage = storyboardLayoutEngineService.roundToDecimal(
    (scaleControls.scaleFactor / 2) * 100,
    0
  ); // converting 200% into 100%

  // styles
  const sliderProgressStyle: CSSProperties = {
    width: `${sliderPercentage}%`
  };
  const progressHeadStyle: CSSProperties = {
    left: `${sliderPercentage - STORYBOARD_CONSTANTS.SLIDER_HEAD_DIMENSION.WIDTH / 2}%` // placing at the midpoint of the head
  };

  // paint
  return (
    <div className="storyboard-scale-controls-wrapper">
      {/* scale decrease */}
      <div
        className={classnames("storyboard-scale-controls-button", {
          "storyboard-scale-controls-button-disabled": !hasScaleDecrease
        })}
        role="button"
        onClick={onScaleStepDecrease}
      >
        -
      </div>

      {/* progress slider */}
      <div className="storyboard-scale-controls-slider-wrapper">
        <div className="storyboard-scale-controls-slider-track" ref={sliderTrackRef} />
        <div
          className={classnames(
            "storyboard-scale-controls-slider-track",
            "storyboard-scale-controls-slider-progress"
          )}
          role="button"
          style={sliderProgressStyle}
        />
        <div
          ref={progressHeadRef}
          className="storyboard-scale-controls-slider-head"
          style={progressHeadStyle}
          role="button"
          onMouseDown={onHeadMouseDown}
        />
      </div>

      {/* scale increase */}
      <div
        className={classnames("storyboard-scale-controls-button", {
          "storyboard-scale-controls-button-disabled": !hasScaleIncrease
        })}
        role="button"
        onClick={onScaleStepIncrease}
      >
        +
      </div>

      {/* scale info */}
      <div className="storyboard-scale-controls-scale-info">
        {sliderPercentage}%
      </div>

      {/* best fit */}
      <div
        className="storyboard-scale-controls-button"
        role="button"
        onClick={onBestFitClick}
      >
        <div className="storyboard-scale-controls-fit-size-icon" />
      </div>
    </div>
  );
}
