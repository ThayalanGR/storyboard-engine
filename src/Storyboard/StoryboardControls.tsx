import { IDimension } from "./Storyboard.store";
import StoryboardScaleControls from "./StoryboardScaleControls";

export default function StoryboardControls(props: { dimension: IDimension }) {
  // props
  const { dimension } = props;

  // paint
  return (
    <div className="storyboard-controls-wrapper" style={{ ...dimension }}>
      <StoryboardScaleControls />
    </div>
  );
}
