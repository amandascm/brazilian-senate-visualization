// global objects
const svg_dimensions = [0,0,500,300]
const circles = get_circles_positions(dimensions=svg_dimensions)

// functions
function get_circles_positions(dimensions, layers=6, circles_per_layer=14, circle_radius=8) {
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
        "#005DAA", "#7DC9FF", "#0F0073",
        "#108B35", "#FFA500", "#FF5460",
        "#56E85D", "#698EE9", "#C200C6",
        "#EC008C", "#EC6429", "#379E8D",
        "#CC0000", "#0080FF",
    ]
    return d3.scaleOrdinal().domain(cattegories).range(
        colors.slice(0,cattegories.length)
    )
}

function get_svg() {
    const svg = d3.select('body')
                    .append('svg')
                    .attr('width', svg_dimensions[2])
                    .attr('height', svg_dimensions[3])
                    .attr('x', svg_dimensions[0])
                    .attr('y', svg_dimensions[1])
    return svg
}

async function set_circles() {
    const political_parties_senators = await get_data()
    const party_color = get_colors(Object.keys(political_parties_senators))
    const svg = get_svg()
    svg.selectAll('circle')
        .data(Object.values(political_parties_senators).flat())
        .enter()
        .append('circle')
        .style('fill', d => {
            return party_color(d.senator_party)
        })
        .attr('cx', (_,i) => circles[i].cx)
        .attr('cy', (_,i) => circles[i].cy)
        .attr('r', (_,i) => circles[i].r)
}

function main() {
    set_circles()
}

// main
main()
