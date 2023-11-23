import {
  IDimension,
  IStoryboardElement,
  IStoryboardElementPosition,
  IStoryboardScaleControls,
  STORYBOARD_CONSTANTS,
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
    const uniqueId = this.generateUUID();

    const newStoryboardElement: IStoryboardElement = {
      elementId: `dummy_element_${uniqueId}`,
      dimension: { width: STORYBOARD_CONSTANTS.DEFAULT_ELEMENT_DIMENSION.WIDTH, height: STORYBOARD_CONSTANTS.DEFAULT_ELEMENT_DIMENSION.HEIGHT },
      position: { x: 0, y: 0 },
      content: `dummy_element (${uniqueId})`
    };

    const { position: suitablePosition, dimension: suitableDimension } = this.findSuitablePosition(newStoryboardElement, storyboard.elements, storyboard.dimension);
    newStoryboardElement.position = suitablePosition;
    newStoryboardElement.dimension = suitableDimension;

    const newElements = [...storyboard.elements, newStoryboardElement];

    updateStoryBoard({ ...storyboard, elements: newElements, });
    updateActiveElementId(newStoryboardElement.elementId);
  }

  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
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

  findSuitablePosition(newElement: IStoryboardElement, elements: IStoryboardElement[], container: IDimension): { position: IStoryboardElementPosition, dimension: IDimension } {
    const adjustedElement = { ...newElement }; // Make a copy to avoid modifying the original

    // Create a 2D grid representation of the container
    const grid = Array.from({ length: container.height }, () => Array(container.width).fill(false));

    // Mark occupied cells for existing elements
    for (const element of elements) {
      const { position: { x, y }, dimension: { width, height } } = element;
      for (let i = y; i < Math.floor(y + height); i++) {
        for (let j = x; j < Math.floor(x + width); j++) {
          grid[i][j] = true;
        }
      }
    }

    // Try to fit the new element into the grid
    for (let i = 0; i <= Math.floor(container.height - adjustedElement.dimension.height); i++) {
      for (let j = 0; j <= Math.floor(container.width - adjustedElement.dimension.width); j++) {
        let canFit = true;
        i = Math.floor(i)
        j = Math.floor(j)
        // Check if the new element can fit in the current position
        for (let k = i; k < Math.floor(i + adjustedElement.dimension.height); k++) {
          for (let l = j; l < Math.floor(j + adjustedElement.dimension.width); l++) {
            k = Math.floor(k)
            l = Math.floor(l)
            if (grid[k][l]) {
              canFit = false;
              break;
            }
          }
          if (!canFit) break;
        }

        if (canFit) {
          // Found a suitable position
          adjustedElement.position = { x: j, y: i };
          return adjustedElement;
        }
      }
    }

    // If no suitable position is found, resort to the strategies
    // TODO: Option 1: Reduce the dimension to fit into the near available space

    // Option 2: Position at the start of the container with the passed dimension
    adjustedElement.position = { x: 0, y: 0 };

    return adjustedElement;

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
