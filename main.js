// global objects
const svg_dimensions = [0,0,700,380]
const [circles, number_loc] = get_circles_positions(dimensions=svg_dimensions)

// functions
function get_circles_positions(dimensions, layers=6, circles_per_layer=14, circle_radius=13) {
    const [x, y, w, h] = dimensions
    const center = {'x': (x + w/2),
                    'y': (y + h - 2*circle_radius)}
    const layers_gap = 1 * circle_radius
    const min_radius = (w - (2 * layers * 2 * circle_radius) - (2 * (layers - 1) * layers_gap)) / 2
    const gap_angle = Math.PI / (circles_per_layer - 1)
    const number_loc = [center.x - 0.3*min_radius, center.y-0.8*min_radius, 0.6*min_radius, 0.8*min_radius]

    const circles = []
    let counter = 0
    // iterate over circles
    for(let c=0; c<circles_per_layer; c++) {
        const circle_angle = c * gap_angle
        // alternate iterations over layer: start by min_radius and start by max_radius
        let update_l = (l) => l+1
        let l = 1
        let end_l = layers + 1
        if(counter % 2 == 0) {
            l = layers
            end_l = 0
            update_l = (l) => l-1
        }
        counter++
        // iterate over layers
        while(l != end_l) {
            const layer_radius = min_radius + ((l-1) * 2 * circle_radius) + ((l-1) * layers_gap) + circle_radius
            const circle={} // cx, cy, r
            const cy =  center.y - Math.sin(circle_angle) * layer_radius
            const cx = center.x + Math.cos(circle_angle) * layer_radius
            circle['cx'] = cx
            circle['cy'] = cy
            circle['r'] = circle_radius
            circles.push(circle)
            l = update_l(l)
        }
    }
    return [circles, number_loc]
}

async function get_data() {
    const senators_codes_set = {} // maps all unique senators codes
    const political_parties_senators = {} // keys are unique parties and values are lists os senators index
    await d3.dsv(';','./lista-parlamentar-em-exercicio.csv', (data) => {
            const [senator_pic_url, senator_name, senator_party, senator_code] = [
                data['ListaParlamentarEmExercicio.Parlamentares.Parlamentar.IdentificacaoParlamentar.UrlFotoParlamentar'],
                data['ListaParlamentarEmExercicio.Parlamentares.Parlamentar.IdentificacaoParlamentar.NomeParlamentar'],
                data['ListaParlamentarEmExercicio.Parlamentares.Parlamentar.IdentificacaoParlamentar.SiglaPartidoParlamentar'],
                data['ListaParlamentarEmExercicio.Parlamentares.Parlamentar.IdentificacaoParlamentar.CodigoParlamentar']
            ]
            if(
                senator_pic_url
                && senator_name
                && senator_party
                && senator_code
                && !senators_codes_set[senator_code]
            ) {
                senators_codes_set[senator_code] = true
                const senator = {
                    'senator_pic_url': senator_pic_url,
                    'senator_name': senator_name,
                    'senator_party': senator_party,
                    'senator_code': senator_code,
                }
                if(!political_parties_senators[senator_party]) political_parties_senators[senator_party] = [senator]
                else political_parties_senators[senator_party].push(senator)
            }
        }
    )
    return political_parties_senators
}

function get_colors(cattegories) {
    const colors = [
        '#005DAA', '#7DC9FF', '#0F0073',
        '#108B35', '#FFA500', '#FF5460',
        '#56E85D', '#698EE9', '#C200C6',
        '#EC008C', '#EC6429', '#379E8D',
        '#CC0000', '#0080FF',
    ]
    return d3.scaleOrdinal().domain(cattegories).range(
        colors.slice(0,cattegories.length)
    )
}

function get_svg_div() {
    const svg_div = d3.select('body')
        .append('div')
            .style('display', 'flex')
            .style('justify-content', 'center')
            .append('div')
                .attr('id', 'svg_div')
                .style('display', 'flex')
                .style('flex-direction', 'column')
                .style('justify-content', 'center')
                .style('align-items', 'center')
                .style('padding', '10px')
                .style('width', `${1.5 * svg_dimensions[2]}px`)
                .style('position', 'relative')
    return svg_div
}

function set_non_used_circles(svg) {
    // set non-used circles
    svg.selectAll('circle')
        .data(circles)
        .enter()
        .append('circle')
        .style('fill','#DBDBDB')
        .attr('cx', (_,i) => circles[i].cx)
        .attr('cy', (_,i) => circles[i].cy)
        .attr('r', (_,i) => circles[i].r)
}

function on_circle_click(senator_name, senator_party, senator_pic_url,) {
    d3.select('#tooltip-div')
        .html(`<p style='text-align: center; font-family: arial'><span style='font-weight:bold'>Nome: </span><br>${senator_name}<br><span style='font-weight:bold'>Partido: </span><br>${senator_party}</p><img style='width: 150px' src='${senator_pic_url}'></img><br><button onClick='on_tooltip_close()'>Fechar</button>`)
        .style("visibility", "visible")
}

function on_tooltip_close() {
    d3.select('#tooltip-div')
        .style("visibility", "hidden")
}

async function set_visualization() {
    const political_parties_senators = await get_data()
    const party_color = get_colors(Object.keys(political_parties_senators))
    const svg_div = get_svg_div()
    const senators = Object.values(political_parties_senators).flat()

    //svg
    const svg = svg_div.append('svg')
                    .attr('width', svg_dimensions[2])
                    .attr('height', svg_dimensions[3])
                    .attr('x', svg_dimensions[0])
                    .attr('y', svg_dimensions[1])
    
    // set existing data corresponding circles
    svg.selectAll('circle')
        .data(senators)
        .enter()
        .append('circle')
        .attr('id', d => d.senator_code)
        .style('fill', d => {
            return party_color(d.senator_party)
        })
        .attr('cx', (_,i) => circles[i].cx)
        .attr('cy', (_,i) => circles[i].cy)
        .attr('r', (_,i) => circles[i].r)
        .on('mouseover', function () {
            d3.select(this)
            .style('stroke-width', 3)
            .style('stroke', 'black')
        })
        .on('mouseout', function () {
            d3.select(this)
            .style('stroke-width', 0)
        })
        .attr('onclick', (d) => `on_circle_click('${d.senator_name}','${d.senator_party}','${d.senator_pic_url}')`)
    
    svg.append('text')
        .text(senators.length)
        .style('font-size', '90px')
        .style('font-weight', 'bold')
        .style('font-family', 'arial')
        .attr('x', svg_dimensions[2]/2)
        .attr('y', svg_dimensions[1]+svg_dimensions[3])
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'baseline')
    set_non_used_circles(svg)

    // legends
    const legend_div = d3.select('#svg_div')
                            .append('div')
                                .attr('id', 'legend-div')
                                .style('display', 'flex')
                                .style('justify-content', 'center')
                                .style('align-items', 'center')
                                .style('padding', '10px')
                                .style('max-width', `${svg_dimensions[2]}px`)
                                .style('flex-wrap', 'wrap')
    legend_div.append('text')
        .text('Partidos: ')
        .style('font-family', 'arial')
        .style('font-size', '20px')
        .style('font-weight', 'bold')

    legend_div.selectAll('div')
        .data(Object.keys(political_parties_senators))
        .enter()
        .append('div')
        .style('padding', '5px')
        .append("text")
        .text(d => d)
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .style('font-family', 'arial')
        .style('color', 'white')
        .style('background-color', d => {
            return party_color(d)
        })

    // tooltip
    svg_div.append('div')
            .attr('id', 'tooltip-div')
            .style('display', 'flex')
            .style('flex-direction', 'column')
            .style('justify-content', 'center')
            .style('align-items', 'center')
            .style("position", "absolute")
            .style("right", "0px")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
}

function main() {
    set_visualization()
}

// main
main()
