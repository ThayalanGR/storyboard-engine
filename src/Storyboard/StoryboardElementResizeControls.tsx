import React, { RefObject, useCallback, useRef } from "react";
import {
  IDimension,
  IStoryboardElementPosition,
  STORYBOARD_CONSTANTS
} from "./Storyboard.store";
import StoryboardLayoutEngineService from "./StoryboardLayoutEngine.service";
import { IElementResizeInfo } from "./StoryboardElement";

export default function StoryboardElementResizeControls(props: {
  updateElementDimension: (
    element: HTMLElement,
    resizeInfo: IElementResizeInfo
  ) => void;
}) {
  // props
  const { updateElementDimension } = props;

  // services
  const storyboardLayoutEngineService = StoryboardLayoutEngineService.getInstance();

  // refs
  const previousResizeInfo = useRef<IElementResizeInfo>();
  const topRef = useRef<HTMLDivElement | null>(null);
  const topRightRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const bottomRightRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const bottomLeftRef = useRef<HTMLDivElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const topLeftRef = useRef<HTMLDivElement | null>(null);

  // handlers
  const onResizeHandleMouseDown = useCallback(
    (
      type:
        | "bottom"
        | "bottom-right"
        | "right"
        | "left"
        | "bottom-left"
        | "top"
        | "top-right"
        | "top-left",
      resizeHandleRef: RefObject<HTMLDivElement>
    ) => (event: React.MouseEvent<HTMLDivElement>) => {
      // this prevents the parent's repositioning stuff
      event.stopPropagation();

      const handleMouseMove = (moveEvent: MouseEvent) => {

        const handleElement = resizeHandleRef.current;
        if (!handleElement) return;

        const storyboardRootContainerBoundingRect = handleElement.parentElement?.parentElement?.getBoundingClientRect();
        const [storyX, storyY, storyRight, storyBottom] = [
          (storyboardRootContainerBoundingRect?.x ?? 0) + 1, // 1 for storyboard wrapper border compensation
          (storyboardRootContainerBoundingRect?.y ?? 0) + 1,
          storyboardRootContainerBoundingRect?.right ?? 0,
          storyboardRootContainerBoundingRect?.bottom ?? 0
        ];

        const parentElementBoundingRect = handleElement.parentElement?.getBoundingClientRect();
        let [x1, y1] = [
          parentElementBoundingRect?.x ?? 0,
          parentElementBoundingRect?.y ?? 0
        ];
        const [originalX1, originalY1] = [x1, y1];

        let [width, height] = [
          parentElementBoundingRect?.width ?? 0,
          parentElementBoundingRect?.height ?? 0
        ];
        const [originalParentElementWidth, originalParentElementHeight] = [
          width,
          height
        ];

        let [x2, y2] = [
          storyboardLayoutEngineService.getClampedNumber(
            moveEvent.clientX,
            storyX,
            storyRight
          ),
          storyboardLayoutEngineService.getClampedNumber(
            moveEvent.clientY,
            storyY,
            storyBottom
          )
        ];

        switch (type) {
          case "bottom":
            height = y2 - y1;
            break;
          case "right":
            width = x2 - x1;
            break;
          case "bottom-right":
            width = x2 - x1;
            height = y2 - y1;
            break;
          case "bottom-left":
            x1 = x2;
            x2 = parentElementBoundingRect?.right ?? 0;
            width = x2 - x1;
            height = y2 - y1;
            break;
          case "left":
            x1 = x2;
            x2 = parentElementBoundingRect?.right ?? 0;
            width = x2 - x1;
            break;
          case "top-left":
            x1 = x2;
            y1 = y2;
            x2 = parentElementBoundingRect?.right ?? 0;
            y2 = parentElementBoundingRect?.bottom ?? 0;
            width = x2 - x1;
            height = y2 - y1;
            break;
          case "top":
            y1 = y2;
            y2 = parentElementBoundingRect?.bottom ?? 0;
            height = y2 - y1;
            break;
          case "top-right":
            y1 = y2;
            y2 = parentElementBoundingRect?.bottom ?? 0;
            width = x2 - x1;
            height = y2 - y1;
            break;
          default:
            break;
        }

        const dimension: IDimension = { width, height };

        // resize conditional restriction block
        const hasValidWidth =
          dimension.width >= STORYBOARD_CONSTANTS.MINIMUM_ELEMENT_DIMENSION.WIDTH;
        const hasValidHeight =
          dimension.height >=
          STORYBOARD_CONSTANTS.MINIMUM_ELEMENT_DIMENSION.HEIGHT;

        if (!hasValidWidth && !hasValidHeight) {
          return;
        } else if (!hasValidWidth && hasValidHeight) {
          dimension.width = originalParentElementWidth;
          x1 = originalX1;
        } else if (!hasValidHeight && hasValidWidth) {
          dimension.height = originalParentElementHeight;
          y1 = originalY1;
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

        const resizeInfo: IElementResizeInfo = { dimension, position };

        if (moveEvent.type !== "mouseup") previousResizeInfo.current = resizeInfo;

        if (previousResizeInfo.current)
          updateElementDimension(
            handleElement.parentElement as HTMLElement,
            previousResizeInfo.current
          );
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [previousResizeInfo, updateElementDimension, storyboardLayoutEngineService]
  );

  // paint
  return (
    <>
      {/* top */}
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-top storyboard-element-resize-mystery"
        role="button"
        ref={topRef}
        onMouseDown={onResizeHandleMouseDown("top", topRef)}
      />

      {/* bottom */}
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-bottom"
        role="button"
        ref={bottomRef}
        onMouseDown={onResizeHandleMouseDown("bottom", bottomRef)}
      />

      {/* left */}
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-left"
        role="button"
        ref={leftRef}
        onMouseDown={onResizeHandleMouseDown("left", leftRef)}
      />

      {/* right */}
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-right"
        role="button"
        ref={rightRef}
        onMouseDown={onResizeHandleMouseDown("right", rightRef)}
      />

      {/* top - left */}
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-top-left"
        role="button"
        ref={topLeftRef}
        onMouseDown={onResizeHandleMouseDown("top-left", topLeftRef)}
      />

      {/* top - right */}
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-top-right"
        role="button"
        ref={topRightRef}
        onMouseDown={onResizeHandleMouseDown("top-right", topRightRef)}
      />

      {/* bottom - left */}
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-bottom-left"
        role="button"
        ref={bottomLeftRef}
        onMouseDown={onResizeHandleMouseDown("bottom-left", bottomLeftRef)}
      />

      {/* bottom - right */}
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-bottom-right"
        role="button"
        ref={bottomRightRef}
        onMouseDown={onResizeHandleMouseDown("bottom-right", bottomRightRef)}
      />
    </>
  );
}
