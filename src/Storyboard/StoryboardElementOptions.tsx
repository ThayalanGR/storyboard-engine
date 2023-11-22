import React, {
    CSSProperties,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { usePopper } from "react-popper";
import { IStoryboardElement } from "./Storyboard.store";
import StoryboardLayoutEngineService from "./StoryboardLayoutEngine.service";

export const STORYBOARD_ELEMENT_OPTION_HEIGHT = 18;

export default function StoryboardElementOptions(props: {
    element: IStoryboardElement;
    scaleFactor: number;
}) {
    // props
    const { element, scaleFactor } = props;

    // services
    const storyboardLayoutEngineService = StoryboardLayoutEngineService.getInstance()


    // refs
    const [menuButtonRef, setMenuButtonRef] = useState<HTMLDivElement | null>();
    const [menuRef, setMenuRef] = useState<HTMLDivElement | null>();
    const optionsRef = useRef<HTMLDivElement>(null);

    // state
    const [isMenuActive, setIsMenuActive] = useState(false);
    const [position, setPosition] = useState<"top" | "bottom" | "inside">("top");

    // hooks
    const {
        styles: { popper: menuPopperStyles },
        attributes: { popper: menuPopperAttributes },
    } = usePopper(menuButtonRef, menuRef, {
        placement: "right",
        strategy: "fixed",
    });

    // effects
    useLayoutEffect(() => {
        const storyboard = optionsRef.current?.parentElement?.parentElement;
        const storyboardElement = optionsRef.current?.parentElement;
        if (storyboard && storyboardElement) {
            setIsMenuActive(false)
            const boardClientRect = storyboard.getBoundingClientRect();
            const elementClientRect = storyboardElement.getBoundingClientRect();
            const optionsOnTopPosition =
                elementClientRect.top - (STORYBOARD_ELEMENT_OPTION_HEIGHT + 1);
            const optionsOnBottomPosition =
                elementClientRect.bottom + (STORYBOARD_ELEMENT_OPTION_HEIGHT + 1);
            if (optionsOnTopPosition > boardClientRect.top) {
                setPosition("top");
            } else if (optionsOnBottomPosition < boardClientRect.bottom) {
                setPosition("bottom");
            } else {
                setPosition("inside");
            }
        }
    }, [element.dimension, element.position, scaleFactor]);

    // styles
    const wrapperStyle: CSSProperties = useMemo(() => {
        if (position === "top") {
            return {
                top: -(STORYBOARD_ELEMENT_OPTION_HEIGHT + 1), // +1 for push above/below border
            };
        } else if (position === "bottom") {
            return {
                bottom: -(STORYBOARD_ELEMENT_OPTION_HEIGHT + 1), // +1 for push above/below border
            };
        }

        return {
            top: 4, // +4 for resize handle buffer
            right: 4,
        };
    }, [position]);

    // handlers
    const onDeleteElementClick = () => storyboardLayoutEngineService.deleteElement(element.elementId);



    // paint
    return (
        <>
            <div
                className="storyboard-element-options-wrapper"
                style={wrapperStyle}
                ref={optionsRef}
            >
                <div
                    className="storyboard-element-option"
                    role="button"
                    onClick={() => setIsMenuActive(!isMenuActive)}
                    ref={setMenuButtonRef}
                >
                    <div className="storyboard-element-option-menu-icon">
                        <span />
                        <span />
                        <span />
                    </div>
                </div>
            </div>
            {/* menu */}

            {isMenuActive && <div
                className="storyboard-element-option-menu"
                ref={setMenuRef}
                style={menuPopperStyles}
                {...menuPopperAttributes}
            >
                <div
                    className="storyboard-element-option-menu-item"
                    role="button"
                    onClick={onDeleteElementClick}
                >
                    Delete element
                </div>
                <div
                    className="storyboard-element-option-menu-item storyboard-element-option-menu-item-inactive"
                    role="button"
                >
                    Duplicate element
                </div>
            </div>}
        </>
    );
}
