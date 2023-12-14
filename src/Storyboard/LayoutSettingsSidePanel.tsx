import React from 'react'
import { IDimension, useStoryboardStore } from './Storyboard.store'

export default function LayoutSettingsSidePanel(props: { dimension: IDimension }) {
    // props
    const { dimension } = props

    // state
    const { storyboard, updateStoryBoard } = useStoryboardStore()
    const { dimension: { width, height } } = storyboard;

    // handlers
    const onValueChange = (type: 'width' | 'height', value: number) => {
        updateStoryBoard({ ...storyboard, dimension: { ...storyboard.dimension, [type]: value } })
    }

    // paint
    return (
        <div className='layout-settings-side-panel-wrapper' style={{ ...dimension }}>
            <div style={{ position: 'absolute', top: 15, left: 5, }}>Layout Settings</div>
            <div>Width: <input type="number" value={width} onChange={e => onValueChange('width', +e.target.value)} /></div>
            <div>Height: <input type="number" value={height} onChange={e => onValueChange('height', +e.target.value)} /></div>
        </div>
    )
}
