import { CSSProperties } from "react";
import { IDimension } from "./Storyboard.store";

export default function ToolbarToggleButton(props: {
  toolbarDimension: IDimension;
  sidePanelDimension: IDimension;
  toggle: () => void;
}) {
  // props
  const { toolbarDimension, sidePanelDimension, toggle } = props;

  // compute
  const toggleButtonSize = 30;
  const hasToolbar = toolbarDimension.height > 0;
  const hasSidePanel = sidePanelDimension.height > 0;
  const toggleTitle = hasToolbar ? "Hide toolbar" : "Show toolbar";
  const toggleIcon = hasToolbar ? "^" : ">";

  // styles
  const style: CSSProperties = {
    width: toggleButtonSize,
    height: toggleButtonSize,
    top: hasToolbar ? toolbarDimension.height - toggleButtonSize : 0,
    right: hasSidePanel ? sidePanelDimension.width : 0
  };

  // paint
  return (
    <button
      className="toolbar-toggle-button"
      style={style}
      onClick={toggle}
      title={toggleTitle}
    >
      {toggleIcon}
    </button>
  );
}
