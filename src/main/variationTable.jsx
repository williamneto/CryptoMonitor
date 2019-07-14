import React from "react"

export default props => {
    const variations = props.variations || []

    const renderRows = () => {
        return variations.map(variation => (
            <tr className={variation.style}>
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