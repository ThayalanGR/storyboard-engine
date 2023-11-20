import React, { useCallback, useRef } from "react";
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

  // refs
  const previousResizeInfo = useRef<IElementResizeInfo>();
  const storyboardLayoutEngineService = useRef(
    StoryboardLayoutEngineService.getInstance()
  ).current;

  // handlers
  const onDrag = useCallback(
    (
      type:
        | "bottom"
        | "bottom-right"
        | "right"
        | "left"
        | "bottom-left"
        | "top"
        | "top-right"
        | "top-left"
    ) => (event: React.DragEvent<HTMLDivElement>) => {
      // this prevents the parent's repositioning stuff
      event.stopPropagation();

      const storyboardRootContainerBoundingRect = event.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
      const [storyX, storyY, storyRight, storyBottom] = [
        (storyboardRootContainerBoundingRect?.x ?? 0) + 1, // 1 for storyboard wrapper border compensation
        (storyboardRootContainerBoundingRect?.y ?? 0) + 1,
        storyboardRootContainerBoundingRect?.right ?? 0,
        storyboardRootContainerBoundingRect?.bottom ?? 0
      ];

      // boundary checking block
      if (event.clientX <= 0 && event.clientY <= 0) return;

      const parentElementBoundingRect = event.currentTarget.parentElement?.getBoundingClientRect();
      let [x1, y1] = [
        parentElementBoundingRect?.x ?? 0,
        parentElementBoundingRect?.y ?? 0
      ];
      const [originalX1, originalY1] = [x1, y1];

      let [x2, y2] = [
        storyboardLayoutEngineService.getClampedNumber(
          event.clientX,
          storyX,
          storyRight
        ),
        storyboardLayoutEngineService.getClampedNumber(
          event.clientY,
          storyY,
          storyBottom
        )
      ];

      let [width, height] = [
        parentElementBoundingRect?.width ?? 0,
        parentElementBoundingRect?.height ?? 0
      ];
      const [originalParentElementWidth, originalParentElementHeight] = [
        width,
        height
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

      if (event.type !== "dragend") previousResizeInfo.current = resizeInfo;

      if (previousResizeInfo.current)
        updateElementDimension(
          event?.currentTarget?.parentElement as HTMLElement,
          previousResizeInfo.current
        );
    },
    [previousResizeInfo, updateElementDimension]
  );

  // paint
  return (
    <>
      {/* top */}
      <div className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-top" />
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-top storyboard-element-resize-mystery"
        role="button"
        draggable
        onDrag={onDrag("top")}
        onDragEnd={onDrag("top")}
      />

      {/* bottom */}
      <div className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-bottom" />
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-bottom storyboard-element-resize-mystery"
        role="button"
        draggable
        onDrag={onDrag("bottom")}
        onDragEnd={onDrag("bottom")}
      />

      {/* left */}
      <div className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-left" />
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-left storyboard-element-resize-mystery"
        role="button"
        draggable
        onDrag={onDrag("left")}
        onDragEnd={onDrag("left")}
      />

      {/* right */}
      <div className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-right" />
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-right storyboard-element-resize-mystery"
        role="button"
        draggable
        onDrag={onDrag("right")}
        onDragEnd={onDrag("right")}
      />

      <div className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-top-left" />
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-top-left storyboard-element-resize-mystery"
        role="button"
        draggable
        onDrag={onDrag("top-left")}
        onDragEnd={onDrag("top-left")}
      />

      <div className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-top-right" />
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-top-right storyboard-element-resize-mystery"
        role="button"
        draggable
        onDrag={onDrag("top-right")}
        onDragEnd={onDrag("top-right")}
      />

      {/* bottom - left */}
      <div className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-bottom-left" />
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-bottom-left storyboard-element-resize-mystery"
        role="button"
        draggable
        onDrag={onDrag("bottom-left")}
        onDragEnd={onDrag("bottom-left")}
      />

      {/* bottom - right */}
      <div className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-bottom-right" />
      <div
        className="storyboard-element-resize-control storyboard-element-resize-control-rect-handle-bottom-right storyboard-element-resize-mystery"
        role="button"
        draggable
        onDrag={onDrag("bottom-right")}
        onDragEnd={onDrag("bottom-right")}
      />
    </>
  );
}
