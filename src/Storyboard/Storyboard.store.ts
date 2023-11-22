import { create } from "zustand";

export interface IStoryboardStore {
  storyboard: IStoryboard;
  updateStoryBoard: (storyboard: IStoryboard) => void;

  activeElementId: string | null;
  updateActiveElementId: (activeElementId: string | null) => void;

  scaleControls: IStoryboardScaleControls;
  updateScaleControls: (scaleControls: IStoryboardScaleControls) => void;
}

export interface IStoryboard {
  boardId: string;
  dimension: IDimension;
  elements: IStoryboardElement[];
}

export interface IStoryboardElement {
  elementId: string;
  dimension: IDimension;
  content: string;
  position: IStoryboardElementPosition;
}

export interface IStoryboardElementPosition {
  x: number;
  y: number;
}

export interface IStoryboardScaleControls {
  bestFit: boolean;
  scaleFactor: number;
}

export interface IDimension {
  width: number;
  height: number;
}

export const useStoryboardStore = create<IStoryboardStore>((set) => ({
  storyboard: {
    boardId: "dummy_board",
    dimension: {
      width: 1280,
      height: 690
    },
    elements: [
      {
        elementId: "dummy_element_1",
        dimension: { width: 1280 / 2, height: 200 },
        position: { x: 0, y: 0 },
        content: "Element - 1"
      }
    ]
  },

  activeElementId: null,
  updateActiveElementId: (activeElementId) => set(() => ({ activeElementId })),

  updateStoryBoard: (storyboard) =>
    set(() => ({
      storyboard
    })),

  scaleControls: {
    bestFit: true,
    scaleFactor: 1.0
  },
  updateScaleControls: (scaleControls) =>
    set(() => ({
      scaleControls
    }))
}));

export const STORYBOARD_CONSTANTS = {
  SLIDER_HEAD_DIMENSION: {
    WIDTH: 10,
    HEIGHT: 18
  },
  STORYBOARD_SCALE_MIN_MAX: {
    MIN: 0.2, // 10%
    MAX: 2.0, // 200%
    LOWER_MIN: 0.1, // 5%
    UPPER_MAX: 2.0 // 200%
  },
  MINIMUM_ELEMENT_DIMENSION: {
    WIDTH: 75,
    HEIGHT: 75
  },
  ELEMENT_PADDING: 5
};
