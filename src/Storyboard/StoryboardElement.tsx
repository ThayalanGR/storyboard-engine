import React, { CSSProperties, useCallback, useEffect, useMemo, useRef } from "react";

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
import StoryboardElementOptions from "./StoryboardElementOptions";

export interface IElementResizeInfo {
  dimension: IDimension;
  position: IStoryboardElementPosition;
}

export default function StoryboardElement(props: {
  element: IStoryboardElement;
}) {
  // props
  const {
    element
  } = props;
  const { elementId, position, dimension, content } = element;

  // services
  const storyboardLayoutEngineService = StoryboardLayoutEngineService.getInstance();

  // refs
  const elementRef = useRef<HTMLDivElement>(null);
  const positionChangeOffsetTracker = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // hooks
  const { clickedOutside, removeListener, resetListener } = useClickOutsideListener({
    componentsReference: [elementRef],
    classNames: ['storyboard-element', 'toolbar-action-item-delete-element']
  });

  // state
  const {
    scaleControls: { scaleFactor },
    storyboard,
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
      resetListener();
    else
      removeListener();

    return () => {
      removeListener();
    };
  }, [isActiveElement]);

  useEffect(() => {
    if (clickedOutside) {
      updateActiveElementId(null);
      removeListener();
    }
  }, [clickedOutside]);

  // styles
  const elementStyle: CSSProperties = {
    width: dimension.width,
    height: dimension.height,
    left: position.x,
    top: position.y,
    zIndex: isActiveElement ? STORYBOARD_CONSTANTS.STORYBOARD_ELEMENT_ELEVATIONS.ACTIVE_ELEMENT : STORYBOARD_CONSTANTS.STORYBOARD_ELEMENT_ELEVATIONS.BASE_ELEMENT
  };

  const elementCoreStyle: CSSProperties = {
    width: (elementStyle.width as number) - STORYBOARD_CONSTANTS.ELEMENT_PADDING * 2,
    height: (elementStyle.height as number) - STORYBOARD_CONSTANTS.ELEMENT_PADDING * 2
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
            x: position.x,
            y: position.y
          },
          dimension: {
            width: dimension.width,
            height: dimension.height
          }
        };
        updateStoryBoard({ ...storyboard, elements: newElements });
      }
    },
    [storyboard, updateStoryBoard, currentElementIndex, scaleFactor]
  );


  const onPositionChange = useCallback(
    (event: MouseEvent) => {
      if (event.clientX <= 0 && event.clientY <= 0) return;

      const [clientX, clientY] = [event.clientX / scaleFactor, event.clientY / scaleFactor]

      const storyboardRootContainerBoundingRect = elementRef.current?.parentElement?.getBoundingClientRect();
      const [storyX, storyY, storyRight, storyBottom] = [
        ((storyboardRootContainerBoundingRect?.x ?? 0) / scaleFactor),
        ((storyboardRootContainerBoundingRect?.y ?? 0) / scaleFactor),
        ((storyboardRootContainerBoundingRect?.right ?? 0) / scaleFactor),
        ((storyboardRootContainerBoundingRect?.bottom ?? 0) / scaleFactor)
      ];

      const offsetX = clientX - (positionChangeOffsetTracker.current.x / scaleFactor);
      const offsetY = clientY - (positionChangeOffsetTracker.current.y / scaleFactor);

      const elementBoundingRect = elementRef.current?.getBoundingClientRect();
      const [elementWidth, elementHeight] = [((elementBoundingRect?.width ?? 0) / scaleFactor), ((elementBoundingRect?.height ?? 0) / scaleFactor)]

      let [x1, y1] = [offsetX, offsetY];

      const isRightBoundaryReached = x1 + elementWidth > storyRight;
      const isBottomBoundaryReached = y1 + elementHeight > storyBottom;

      // re-position conditional restriction block
      if (isRightBoundaryReached && isBottomBoundaryReached) {
        return;
      } else if (isBottomBoundaryReached && !isRightBoundaryReached) {
        y1 = storyBottom - elementHeight;
      } else if (isRightBoundaryReached && !isBottomBoundaryReached) {
        x1 = storyRight - elementWidth;
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

      const resizeInfo: IElementResizeInfo = {
        dimension: { width: elementWidth, height: elementHeight },
        position
      };

      updateElementDimension(elementRef.current as HTMLElement, resizeInfo);
    },
    [storyboardLayoutEngineService, positionChangeOffsetTracker, updateElementDimension]
  );

  const onPositionChangeStart = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const element = elementRef.current?.getBoundingClientRect();
      positionChangeOffsetTracker.current.x = event.clientX - (element?.left ?? 0);
      positionChangeOffsetTracker.current.y = event.clientY - (element?.top ?? 0);

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onPositionChange)
        window.removeEventListener('mouseup', onMouseUp)
      }

      window.addEventListener('mousemove', onPositionChange)
      window.addEventListener('mouseup', onMouseUp)
    },
    [onPositionChange]
  );


  const onElementClick = useCallback(() => {
    if (!isActiveElement) updateActiveElementId(elementId);
  }, [isActiveElement, elementId, updateActiveElementId]);

  const conditionalFunction = <T extends Function>(func: T): T | undefined =>
    isActiveElement ? func : undefined;

  // paint
  return (
    <div
      className={classNames("storyboard-element", {
        "storyboard-element-active": isActiveElement
      })}
      style={elementStyle}
      onMouseDown={conditionalFunction(onPositionChangeStart)}
      onClick={onElementClick}
      ref={elementRef}
    >
      <div
        className="storyboard-element-core"
        style={elementCoreStyle}
      >
        {content}
      </div>
      {isActiveElement && (
        <>
          <StoryboardElementResizeControls
            updateElementDimension={updateElementDimension}
          />
          <StoryboardElementOptions element={element} />
        </>
      )}
    </div>
  );
}
