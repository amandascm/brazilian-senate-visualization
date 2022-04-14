const generate_circles_positions = (dimensions, layers=6, circles_per_layer=14, circle_radius=8, total_circles=81) => {
    const [x, y, w, h] = dimensions
    const center = {'x': (x + w/2),
                    'y': (y + h - circle_radius)}
    const layers_gap = 1 * circle_radius
    const min_radius = (w - (2 * layers * 2 * circle_radius) - (2 * (layers - 1) * layers_gap)) / 2
    const gap_angle = Math.PI / (circles_per_layer - 1)

    const circles = []
    // iterate over desired layers
    for(let c=0; c<circles_per_layer; c++) {
        const circle_angle = c * gap_angle
        for(let l=1; l<=layers; l++) {
            const layer_radius = min_radius + ((l-1) * 2 * circle_radius) + ((l-1) * layers_gap) + circle_radius
            const circle={} // cx, cy, r
            const cy =  center.y - Math.sin(circle_angle) * layer_radius
            const cx = center.x + Math.cos(circle_angle) * layer_radius
            circle['cx'] = cx
            circle['cy'] = cy
            circle['r'] = circle_radius
            circles.push(circle)
        }
    }
    return circles
}

const main = () => {
    const svg_dimensions = [0,0,500,300]
    const circles = generate_circles_positions(dimensions=svg_dimensions)

    const svg = d3.select("body")
                    .append("svg")
                    .attr("width", svg_dimensions[2])
                    .attr("height", svg_dimensions[3])
                    .attr("x", svg_dimensions[0])
                    .attr("y", svg_dimensions[1])

    svg.selectAll("circle")
        .data(circles)
        .enter()
        .append("circle")
        .attr("cx", (d) => d.cx)
        .attr("cy", d => d.cy)
        .attr("r", d => d.r)
        .style('fill', 'gray')
    
    svg.selectAll('text')
        .data(circles)
        .enter()
        .append('text')
        .attr('x', d => d.cx)
        .attr('y', d => d.cy)
        .text((d,i)=> i)
}

main()
