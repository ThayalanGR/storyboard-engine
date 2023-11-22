import { RefObject, useCallback, useEffect, useState } from 'react';

/**
 * used for any add event listener handlers for preparing callback handler separately (anonymously)
 */
export type TNodeEvent = Event & { target: Node };
type TEventListenerHandler = (this: Element, event: TNodeEvent) => any;


export interface IUseClickOutsideListenerResponse {
    clickedOutside: boolean;
    resetListener: () => void;
    removeListener: () => void;
}

export interface IUseClickOutsideListenerProps {
    /**
     * components refs to be whitelisted from click outside listener
     */
    componentsReference: RefObject<Element>[];
    elementsIds?: string[];
    classNames?: string[];
    options?: {
        /**
         * default true
         */
        initiateOnMount?: boolean;
    };
}

/**
 * Hook that triggers when the click is made outside of the given ref
 *
 * @param componentsReference - component to be listened reference
 *
 * @returns boolean will be true when clicked outside
 */
export const useClickOutsideListener = (props: IUseClickOutsideListenerProps): IUseClickOutsideListenerResponse => {
    // props
    const { componentsReference, options = {}, elementsIds = [], classNames = [] } = props;
    const { initiateOnMount = true } = options;

    // state
    const [clickedOutside, setClickedOutside] = useState(false);
    const [resetCount, setResetCount] = useState(0);

    useEffect(() => {
        if (!clickedOutside) {
            if (resetCount === 0 && initiateOnMount === false) return undefined; // don't return null in useEffect for react version 16 and prior to 16
            // Bind the event listener
            document.addEventListener('mousedown', handleClickOutside as () => void);
        }
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener('mousedown', handleClickOutside as () => void);
        };
    }, [componentsReference, resetCount]);

    // handlers
    const handleClickOutside: TEventListenerHandler = useCallback(
        (event) => {
            let isClickedInsideElements = false;

            elementsIds.some((elementId) => {
                if (document.getElementById(elementId)?.contains(event.target)) {
                    isClickedInsideElements = true;
                }
                return isClickedInsideElements;
            });
            classNames.some((className) => {
                if (document.getElementsByClassName(className)[0]?.contains(event.target)) {
                    isClickedInsideElements = true;
                }
                return isClickedInsideElements;
            });

            componentsReference?.some((component) => {
                if (component?.current?.contains(event.target)) {
                    isClickedInsideElements = true;
                }

                return isClickedInsideElements;
            });

            if (!isClickedInsideElements) {
                setClickedOutside(true);
            }
        },
        [elementsIds, componentsReference],
    );
    // resets the state for next listen
    const resetListener = () => {
        setClickedOutside(false);
        setResetCount(resetCount + 1);
    };

    const removeListener = () => {
        document.removeEventListener('mousedown', handleClickOutside as () => void);
    };

    return { clickedOutside, resetListener, removeListener };
};
