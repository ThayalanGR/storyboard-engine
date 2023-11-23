import React from 'react'
import { IDimension } from './Storyboard.store'

export default function DummySidePanel(props: { dimension: IDimension }) {
    // props
    const { dimension } = props

    // paint
    return (
        <div className='dummy-side-panel-wrapper' style={{ ...dimension }}>DummySidePanel</div>
    )
}
