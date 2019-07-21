import React from "react"

import './variationTable.css'

export default props => {
    const variations = props.variations || []

    const renderRows = () => {
        return variations.map((variation, index) => (
            <tr className={variation.style} key={index}>
                <td>{variation.lastUpdate}</td>
                <td>
                    <i className={variation.icon}></i>
                </td>
                <td>{variation.value}</td>
                <td>{variation.percent} %</td>
            </tr>
        ))
    }

    return (
        <table className="table">
            <thead>
                <tr>
                    <th></th>
                    <th></th>
                    <th>Valor</th>
                    <th>Variação</th>
                </tr>
            </thead>

            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )
}