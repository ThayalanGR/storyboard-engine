import React, { CSSProperties, useCallback, useMemo } from "react";
import classnames from "classnames";
import { useStoryboardStore, STORYBOARD_CONSTANTS } from "./Storyboard.store";
import StoryboardLayoutEngineService from "./StoryboardLayoutEngine.service";

export default function StoryboardScaleControls() {
  // state
  const { scaleControls, updateScaleControls } = useStoryboardStore();

  // memo
  const storyboardLayoutEngineService = useMemo(
    () => StoryboardLayoutEngineService.getInstance(),
    []
  );

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

  const onScaleStepIncrease = () =>
    onScaleChange(scaleControls.scaleFactor + 0.1);

  const onScaleStepDecrease = () =>
    onScaleChange(scaleControls.scaleFactor - 0.1);

  const onBestFitClick = () =>
    updateScaleControls({
      ...scaleControls,
      bestFit: true
    });

  // progress head drag
  const getProgressSlidedPercentage = (e: React.DragEvent<HTMLDivElement>) => {
    const parentElementBoundingRect = e.currentTarget.parentElement?.getBoundingClientRect();
    const draggedWidth = e.clientX - (parentElementBoundingRect?.left ?? 0);
    const progressWidth = parentElementBoundingRect?.width ?? 0;

    const draggedPercentage = storyboardLayoutEngineService.calculatePercentage(
      draggedWidth,
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
        draggedPercentage,
        minPercentage,
        maxPercentage
      )
    );
    return clampedPercentage;
  };

  const onProgressHeadSlide = useCallback(
    (event: React.DragEvent<HTMLDivElement>, newProgress: number) => {
      event.currentTarget.style.left = `${
        newProgress - STORYBOARD_CONSTANTS.SLIDER_HEAD_DIMENSION.WIDTH / 2
      }%`;
      // find and update the scale factor
      const newScaleFactor = storyboardLayoutEngineService.roundToDecimal(
        storyboardLayoutEngineService.calculateValueFromPercentage(
          newProgress,
          STORYBOARD_CONSTANTS.STORYBOARD_SCALE_MIN_MAX.UPPER_MAX * 100
        ) / 100 // / by 100 to make the percentage into decimal
      );
      onScaleChange(newScaleFactor);
    },
    []
  );

  const onHeadDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      const draggedPercentage = getProgressSlidedPercentage(event);
      onProgressHeadSlide(event, draggedPercentage);
    },
    []
  );

  const onHeadDrag = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (event.clientX <= 0) return;
    const draggedPercentage = getProgressSlidedPercentage(event);
    onProgressHeadSlide(event, draggedPercentage);
  }, []);

  const onHeadDragEnd = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      const draggedPercentage = getProgressSlidedPercentage(event);
      onProgressHeadSlide(event, draggedPercentage);
    },
    []
  );

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
    left: `${
      sliderPercentage - STORYBOARD_CONSTANTS.SLIDER_HEAD_DIMENSION.WIDTH / 2
    }%` // placing at midpoint of the head
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
        <div className="storyboard-scale-controls-slider-track" />
        <div
          className={classnames(
            "storyboard-scale-controls-slider-track",
            "storyboard-scale-controls-slider-progress"
          )}
          role="button"
          style={sliderProgressStyle}
        />
        <div
          className="storyboard-scale-controls-slider-head"
          style={progressHeadStyle}
          role="button"
          draggable
          onDragStart={onHeadDragStart}
          onDrag={onHeadDrag}
          onDragEnd={onHeadDragEnd}
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
