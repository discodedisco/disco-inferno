// const pBrowser = document.querySelector('#wheel-canvas');
// const canvasD3 = d3
//     .select('#canvas-container')
//     .append('p')
//     .classed('howdy', true)
//     .classed('partner', true)
//     .text('Howdy partner')
//     .style('color', 'rgba(var(--priYl), 1)')
// ;

// console
//     .log(canvasD3);

const data = [10, 20, 30, 40, 50];

const el = d3
    .select('ul')
    .selectAll('.list-item-test')
    .data(data)
    // .join(enter => {
    //     return enter
    //         .append('li')
    //         .classed('list-item-test', true)
    //         .style('color', 'rgba(var(--priYl), 1)')
    //     ;
    // },
    //     update => update.style('color', 'rgba(var(--priAd), 1)'),
    //     exit => exit.remove()
    // )
    .text(d => d)
;

el
    .enter()
    .append('li')
    .text(d => d)
    ;

el
    .exit()
    .remove()
    ;

console.log(el);
