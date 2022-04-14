const generate_circles_positions = (dimensions, layers=6, circles_per_layer=14, circle_radius=8) => {
    const [x, y, w, h] = dimensions
    const center = {'x': (x + w/2),
                    'y': (y + h - circle_radius)}
    const layers_gap = 1 * circle_radius
    const min_radius = (w - (2 * layers * 2 * circle_radius) - (2 * (layers - 1) * layers_gap)) / 2

    const circles = []
    // iterate over desired layers
    for(let i=1; i<=layers; i++) {
        // current layer radius = initial radius + past layers circle diameter + past gaps + current layer circle radius
        const radius = min_radius + ((i-1) * 2 * circle_radius) + ((i-1) * layers_gap) + circle_radius

        for(let c=0; c<circles_per_layer; c++) {
            const circle={} // cx, cy, r
            const gap_angle = Math.PI / (circles_per_layer - 1)
            const circle_angle = c * gap_angle
            const cy =  center.y - Math.sin(circle_angle) * radius
            const cx = center.x + Math.cos(circle_angle) * radius
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
}

main()
