async function getData() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json');
    if (response.ok) {
      const json = await response.json();
      const baseTemperature = json['baseTemperature'];
      const dataSet = json['monthlyVariance'];
      const minYear = d3.min(dataSet, d => d['year']);
      const maxYear = d3.max(dataSet, d => d['year']);
      const minMonth = d3.min(dataSet, d => d['month']);
      const maxMonth = d3.max(dataSet, d => d['month']);
      const colorSet = ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'];
      const tempSet = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.4, 10.5, 11.6, 12.7];
      const w = 1500;
      const h = 600;
      const padding = 100;
      const headingsContainer = d3.select('#chart-container')
        .append('div')
        .attr('id', 'headings-container');
      headingsContainer.append('h1')
        .text('Monthly Global Land-Surface Temperature')
        .attr('id', 'title');
      headingsContainer.append('h3')
        .html(`${minYear} - ${maxYear}: base temperature ${baseTemperature}&#8451;`)
        .attr('id', 'description');

      const svgContainer = d3.select('#chart-container')
        .append('div')
        .attr('id', 'svg-container')
        .style('position', 'relative');

      const svg = svgContainer.append('svg')
        .attr('width', w)
        .attr('height', h);

      const tooltip = svgContainer.append('div')
        .attr('id', 'tooltip')
        .attr('class', 'bar')
        .style("visibility", "hidden");

      const xScale = d3.scaleBand()
        .domain(dataSet.map(d => d['year']))
        .range([padding, w - padding]);
      const yScale = d3.scaleBand()
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        .rangeRound([padding, h - padding]);
      const threshold = d3.scaleThreshold()
        .domain(tempSet)
        .range(colorSet);
      const legendScale = d3.scaleLinear()
        .domain([1.7, 13.8])
        .range([padding, padding + 250]);

      svg.selectAll('rect')
        .data(dataSet)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('data-month', d => d['month'] - 1)
        .attr('data-year', d => d['year'])
        .attr('data-temp', d => d['variance'] + baseTemperature)
        .attr('width', xScale.step())
        .attr('height', yScale.step())
        .attr('x', d => xScale(d['year']))
        .attr('y', d => yScale(d['month']))
        .attr('fill', d => {
          const temp = d['variance'] + baseTemperature;
          for (let i = 0; i < tempSet.length; i++) {
            if (temp < tempSet[i]) {
              return colorSet[i];
            }
          }
        })
        .on('mouseover', (d, i) => {
          const text = `${d.year} - ${d3.timeFormat('%B')(new Date(2000, d.month - 1))}</br>${(d.variance + baseTemperature).toFixed(1)}&#8451;</br>${d.variance.toFixed(1)}&#8451;`;
          tooltip.html(text)
            .style('top', yScale(d['month']) + 'px')
            .style('left', xScale(d['year']) + 'px')
            .attr('data-year', d.year)
            .style("visibility", "visible")
        })
        .on('mouseout', (d, i) => {
          tooltip.style("visibility", "hidden");
        })

        const xAxis = d3.axisBottom(xScale)
          .tickValues(xScale.domain().filter(year => year % 10 === 0))
          .tickFormat(d3.format('d'));
        const yAxis = d3.axisLeft(yScale)
          .tickFormat(month => d3.timeFormat('%B')(new Date(2000, month - 1)));
        const legendAxis = d3.axisBottom(legendScale)
          .tickValues(threshold.domain())
          .tickFormat(d3.format('.1f'));

        svg.append('g')
          .attr('transform', 'translate(0, ' + (h - padding) + ')')
          .attr('id', 'x-axis')
          .call(xAxis);
        svg.append('g')
          .attr('transform', 'translate(' + padding + ' , 0)')
          .attr('id', 'y-axis')
          .call(yAxis);
        const legend = svg.append('g')
          .attr('id', 'legend');
        legend.append('g')
          .attr('transform', 'translate(0, 15)')
          .call(legendAxis);

        legend.selectAll('rect')
          .data(threshold.range().map(color => {
            const d = threshold.invertExtent(color);
            if (d[0] == null) {
              d[0] = legendScale.domain()[0];
            }
            if (d[1] == null) {
              d[1] = legendScale.domain()[1];
            }
            return d;
          }))
          .enter()
          .append('rect')
          .attr('height', 15)
          .attr('width', d => { return legendScale(d[1]) - legendScale(d[0]); })
          .attr('x', d => legendScale(d[0]))
          .attr('fill', d => threshold(d[0]));
    } else {
      throw new Error('Request Failed!');
    }
  } catch (error) {
    console.log(error);
  }
}

getData();
