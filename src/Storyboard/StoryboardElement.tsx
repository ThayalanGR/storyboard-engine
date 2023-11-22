import React, { useCallback, useEffect, useMemo, useRef } from "react";

import {
  IDimension,
  IStoryboardElement,
  IStoryboardElementPosition,
  STORYBOARD_CONSTANTS,
  useStoryboardStore
} from "./Storyboard.store";
import StoryboardElementResizeControls from "./StoryboardElementResizeControls";
import StoryboardLayoutEngineService from "./StoryboardLayoutEngine.service";
import classNames from "classnames";
import { useClickOutsideListener } from "./useClickOutsideListener";

export interface IElementResizeInfo {
  dimension: IDimension;
  position: IStoryboardElementPosition;
}

export default function StoryboardElement(props: {
  element: IStoryboardElement;
}) {
  // props
  const {
    element: { elementId, position, dimension, content }
  } = props;

  // refs
  const elementRef = useRef<HTMLDivElement>(null)
  const storyboardLayoutEngineService = useRef(
    StoryboardLayoutEngineService.getInstance()
  ).current;
  const positionChangeOffsetTracker = useRef({ x: 0, y: 0 });

  // hooks
  const { clickedOutside, removeListener, resetListener } = useClickOutsideListener({ componentsReference: [elementRef], classNames: ['storyboard-element'] })

  // state
  const {
    storyboard,
    scaleControls: { scaleFactor },
    updateStoryBoard,
    activeElementId,
    updateActiveElementId
  } = useStoryboardStore();
  const currentElementIndex = useMemo(
    () =>
      storyboard.elements.findIndex(
        (element) => element.elementId === elementId
      ),
    [storyboard]
  );
  const isActiveElement = activeElementId === elementId;

  // effects
  useEffect(() => {
    if (isActiveElement)
      resetListener()
    else
      removeListener()

    return () => {
      removeListener()
    }
  }, [isActiveElement])

  useEffect(() => {
    if (clickedOutside) {
      updateActiveElementId(null)
      removeListener()
    }
  }, [clickedOutside])

  // styles
  const elementStyle = {
    width: dimension.width * scaleFactor,
    height: dimension.height * scaleFactor,
    left: position.x * scaleFactor,
    top: position.y * scaleFactor
  };

  const elementCoreStyle = {
    width: elementStyle.width - STORYBOARD_CONSTANTS.ELEMENT_PADDING * 2,
    height: elementStyle.height - STORYBOARD_CONSTANTS.ELEMENT_PADDING * 2
  };

  // handlers
  const updateElementDimension = useCallback(
    (element: HTMLElement, resizeInfo: IElementResizeInfo) => {
      const { position, dimension } = resizeInfo;
      if (element) {
        // position
        element.style.left = `${resizeInfo.position.x}px`;
        element.style.top = `${resizeInfo.position.y}px`;
        // dimension
        element.style.width = `${resizeInfo.dimension.width}px`;
        element.style.height = `${resizeInfo.dimension.height}px`;

        // update the storyboard
        const newElements: IStoryboardElement[] = [...storyboard.elements];
        newElements[currentElementIndex] = {
          ...newElements[currentElementIndex],
          position: {
            x: position.x / scaleFactor,
            y: position.y / scaleFactor
          },
          dimension: {
            width: dimension.width / scaleFactor,
            height: dimension.height / scaleFactor
          }
        };
        updateStoryBoard({ ...storyboard, elements: newElements });
      }
    },
    [storyboard, updateStoryBoard, currentElementIndex, scaleFactor]
  );

  const onPositionChangeStart = (event: React.DragEvent<HTMLDivElement>) => {
    const img = new Image(0, 0);
    img.src = "";
    event.dataTransfer.setDragImage(img, -10000, -10000);

    const element = (event.target as HTMLElement).getBoundingClientRect();
    positionChangeOffsetTracker.current.x = event.clientX - element.left ?? 0;
    positionChangeOffsetTracker.current.y = event.clientY - element.top ?? 0;
  };

  const onPositionChange = (event: React.DragEvent<HTMLDivElement>) => {
    if (event.clientX <= 0 && event.clientY <= 0) return;

    const storyboardRootContainerBoundingRect = event.currentTarget?.parentElement?.getBoundingClientRect();
    const [storyX, storyY, storyRight, storyBottom] = [
      (storyboardRootContainerBoundingRect?.x ?? 0) + 1, // 1 for storyboard wrapper border compensation
      (storyboardRootContainerBoundingRect?.y ?? 0) + 1,
      storyboardRootContainerBoundingRect?.right ?? 0,
      storyboardRootContainerBoundingRect?.bottom ?? 0
    ];

    const offsetX = event.clientX - positionChangeOffsetTracker.current.x;
    const offsetY = event.clientY - positionChangeOffsetTracker.current.y;

    const elementBoundingRect = event.currentTarget?.getBoundingClientRect();

    let [x1, y1] = [offsetX, offsetY];

    const isRightBoundaryReached = x1 + elementBoundingRect.width > storyRight;
    const isBottomBoundaryReached =
      y1 + elementBoundingRect.height > storyBottom;

    // re-position conditional restriction block
    if (isRightBoundaryReached && isBottomBoundaryReached) {
      return;
    } else if (isBottomBoundaryReached && !isRightBoundaryReached) {
      y1 = storyBottom - elementBoundingRect.height;
    } else if (isRightBoundaryReached && !isBottomBoundaryReached) {
      x1 = storyRight - elementBoundingRect.width;
    }

    const position: IStoryboardElementPosition = {
      x: storyboardLayoutEngineService.getClampedNumber(
        x1 - storyX,
        0,
        Infinity
      ),
      y: storyboardLayoutEngineService.getClampedNumber(
        y1 - storyY,
        0,
        Infinity
      )
    };

    const { width, height } = elementBoundingRect;
    const resizeInfo: IElementResizeInfo = {
      dimension: { width, height },
      position
    };

    updateElementDimension(event.currentTarget, resizeInfo);
  };

  const onElementCoreDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    const img = new Image(0, 0);
    img.src = "";
    event.dataTransfer.setDragImage(img, -10000, -10000);
    event.stopPropagation();
  };

  const onElementCoreDrag = (event: React.DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const onElementClick = () => {
    if (!isActiveElement) updateActiveElementId(elementId);
  };

  const conditionalFunction = <T extends Function>(func: T): T | undefined =>
    isActiveElement ? func : undefined;

  // paint
  return (
    <div
      className={classNames("storyboard-element", {
        "storyboard-element-active": isActiveElement
      })}
      style={elementStyle}
      draggable={isActiveElement}
      onDragStart={conditionalFunction(onPositionChangeStart)}
      onDrag={conditionalFunction(onPositionChange)}
      onClick={onElementClick}
      ref={elementRef}
    >
      <div
        className="storyboard-element-core"
        style={elementCoreStyle}
        draggable={isActiveElement}
        onDragStart={conditionalFunction(onElementCoreDragStart)}
        onDrag={conditionalFunction(onElementCoreDrag)}
      >
        {content}
      </div>
      {isActiveElement && (
        <StoryboardElementResizeControls
          updateElementDimension={updateElementDimension}
        />
      )}
    </div>
  );
}
