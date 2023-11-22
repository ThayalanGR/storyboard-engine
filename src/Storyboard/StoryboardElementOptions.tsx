import React, { CSSProperties, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { IDimension, IStoryboardElement } from './Storyboard.store';

export const STORYBOARD_ELEMENT_OPTION_HEIGHT = 18;


export default function StoryboardElementOptions(props: { element: IStoryboardElement, scaleFactor: number }) {
    // props
    const { element, scaleFactor } = props;

    // state
    const [position, setPosition] = useState<'top' | 'bottom' | 'inside'>('top');

    // refs
    const optionsRef = useRef<HTMLDivElement>(null)


    useLayoutEffect(() => {
        const storyboard = optionsRef.current?.parentElement?.parentElement
        const storyboardElement = optionsRef.current?.parentElement
        if (storyboard && storyboardElement) {
            const boardClientRect = storyboard.getBoundingClientRect()
            const elementClientRect = storyboardElement.getBoundingClientRect()
            const optionsOnTopPosition = elementClientRect.top - (STORYBOARD_ELEMENT_OPTION_HEIGHT + 1);
            const optionsOnBottomPosition = elementClientRect.bottom + (STORYBOARD_ELEMENT_OPTION_HEIGHT + 1);
            if (optionsOnTopPosition > boardClientRect.top) { setPosition('top') }
            else if (optionsOnBottomPosition < boardClientRect.bottom) { setPosition('bottom') }
            else { setPosition('inside') }
        }
    }, [element.dimension, element.position, scaleFactor])

    // styles
    const wrapperStyle: CSSProperties = useMemo(() => {
        if (position === 'top') {
            return {
                top: -(STORYBOARD_ELEMENT_OPTION_HEIGHT + 1) // +1 for push above/below border
            }
        } else if (position === 'bottom') {
            return {
                bottom: -(STORYBOARD_ELEMENT_OPTION_HEIGHT + 1) // +1 for push above/below border
            }
        }

        return {
            top: 4, // +4 for resize handle buffer
            right: 4
        }
    }, [position])

    // handlers
    const onMenuItemClick = () => {
        // implement
    }

    // paint
    return (
        <div className='storyboard-element-options-wrapper' style={wrapperStyle} ref={optionsRef}>
            <div className="storyboard-element-option">
                <div className='storyboard-element-option-menu-icon' role='button' onClick={onMenuItemClick}>
                    <span />
                    <span />
                    <span />
                </div>
            </div>
        </div>
    )
}
