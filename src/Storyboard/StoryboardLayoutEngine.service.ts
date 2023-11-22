import {
  IDimension,
  IStoryboardElement,
  IStoryboardScaleControls,
  useStoryboardStore
} from "./Storyboard.store";

export default class StoryboardLayoutEngineService {
  // static items
  private static _storyboardLayoutEngineService: StoryboardLayoutEngineService;

  public static getInstance() {
    if (!StoryboardLayoutEngineService._storyboardLayoutEngineService)
      StoryboardLayoutEngineService._storyboardLayoutEngineService = new StoryboardLayoutEngineService();
    return StoryboardLayoutEngineService._storyboardLayoutEngineService;
  }

  // core functionalities
  public computeStoryboardScaledDimension({
    targetDimension,
    storyboardDimension,
    scaleControls
  }: {
    targetDimension: IDimension;
    storyboardDimension: IDimension;
    scaleControls: IStoryboardScaleControls;
  }) {
    // find the scale factor
    const scaleFactor = scaleControls.bestFit
      ? this.findScaleFactorToFitTargetInsideCurrent({
        targetDimension,
        storyboardDimension
      })
      : scaleControls.scaleFactor;

    // If targetDimension is already smaller, no need to scale up - in this case scaleFactor will be 1.0
    // Apply the scale factor to targetDimension
    const scaledDimension: IDimension = {
      width: storyboardDimension.width * scaleFactor,
      height: storyboardDimension.height * scaleFactor
    };

    return { scaledDimension, scaleFactor };
  }

  private findScaleFactorToFitTargetInsideCurrent({
    targetDimension,
    storyboardDimension
  }: {
    targetDimension: IDimension;
    storyboardDimension: IDimension;
  }): number {
    const widthScaleFactor = targetDimension.width / storyboardDimension.width;
    const heightScaleFactor =
      targetDimension.height / storyboardDimension.height;

    // Choose the smaller scale factor to ensure that the entire target fits inside the container
    const scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);

    // Clamp the scale factor between 10% and 200%
    return Math.max(0.1, Math.min(scaleFactor, 2.0));
  }

  // insert element
  insertElement() {
    const { storyboard, updateStoryBoard, updateActiveElementId } = useStoryboardStore.getState();

    const newStoryboardElement: IStoryboardElement = {
      elementId: `dummy_element_${storyboard.elements.length + 1}`,
      dimension: { width: 200, height: 200 },
      position: { x: 0, y: 0 },
      content: `dummy_element_${storyboard.elements.length + 1}`
    };

    const newElements = [...storyboard.elements, newStoryboardElement];

    updateStoryBoard({ ...storyboard, elements: newElements, });
    updateActiveElementId(newStoryboardElement.elementId);
  }

  deleteElement(elementId: string) {
    const { storyboard, updateStoryBoard, updateActiveElementId } = useStoryboardStore.getState();

    const newElements = storyboard.elements.filter(
      (element) => element.elementId !== elementId
    );

    updateStoryBoard({ ...storyboard, elements: newElements });
    updateActiveElementId(null);
  }

  updateElement(elementId: string, updatedElement: IStoryboardElement) {
    const { storyboard, updateStoryBoard } = useStoryboardStore.getState();

    const newElements = storyboard.elements.filter(
      (element) => element.elementId !== elementId
    );
    newElements.push(updatedElement);

    updateStoryBoard({ ...storyboard, elements: newElements });
  }

  // utils
  public roundToDecimal(value: number, decimalPlaces: number = 1): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(value * factor) / factor;
  }

  public calculatePercentage(part: number, whole: number) {
    return (part / whole) * 100;
  }

  public calculateValueFromPercentage(percentage: number, whole: number) {
    return (percentage / 100) * whole;
  }

  public getClampedNumber(current: number, lower: number, upper: number) {
    return Math.max(lower, Math.min(current, upper));
  }
}
