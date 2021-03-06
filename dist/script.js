// Let's first retrieve data

const reqURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const xhr = new XMLHttpRequest();
xhr.open('GET', reqURL, true);
xhr.send();
xhr.onload = () => {
  const result = JSON.parse(xhr.responseText);
  const dataset = result.monthlyVariance;
  const baseTemperature = result.baseTemperature;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Then, let's build our chart!

  // i) The SVG area:

  const h = 500,
  w = 1700,
  paddingTop = 30,
  paddingBottom = 100,
  paddingLeft = 70,
  paddingRight = 70;

  const svg = d3.select('.SVGChart').
  append('svg').
  attr('height', h).
  attr('width', w);

  // ii) The scales and axes:

  const min_X = d3.min(dataset, d => d.year),
  max_X = d3.max(dataset, d => d.year);

  const xScale = d3.scaleLinear().
  domain([min_X, max_X + 1]).
  range([paddingLeft, w - paddingRight]);

  const yScale = d3.scaleLinear().
  domain([0, 12]).
  range([paddingTop, h - paddingBottom]);

  const xAxis = d3.axisBottom(xScale).
  ticks((2015 - 1760) / 10).
  tickFormat(d3.format('.0f'));

  const yAxis = d3.axisLeft(yScale).
  ticks(12).
  tickValues([0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5]).
  tickFormat((d, i) => months[i]);

  svg.append('g').
  attr('id', 'x-axis').
  attr('transform', 'translate(0, ' + (h - paddingBottom) + ')').
  call(xAxis);

  svg.append('g').
  attr('id', 'y-axis').
  attr('transform', 'translate(' + paddingLeft + ', 0)').
  call(yAxis);

  // iii) Add rect elements

  const minTemp = d3.min(dataset, d => Math.floor(baseTemperature + d.variance)),
  maxTemp = d3.max(dataset, d => Math.floor(baseTemperature + d.variance));

  const linearScale = d3.scaleLinear().
  domain([minTemp, maxTemp]).
  range(['#f9f8da', '#f9800f']);

  const rectHeight = (h - (paddingTop + paddingBottom)) / 12;
  const rectWidth = (w - (paddingLeft + paddingRight)) / (max_X - min_X - 1);

  svg.selectAll('rect').
  data(dataset).
  enter().
  append('rect').
  attr('class', 'cell').
  attr('height', rectHeight).
  attr('width', rectWidth).
  attr('x', (d, i) => xScale(d.year)).
  attr('y', (d, i) => yScale(d.month - 1)).
  attr('fill', d => {
    let temp = Math.floor(baseTemperature + d.variance);
    return linearScale(temp);
  }).
  attr('data-month', d => {
    return d.month - 1;
  }).
  attr('data-year', d => {
    return d.year;
  }).
  attr('data-temp', d => {
    return baseTemperature + d.variance;
  }).
  on("mouseover", handleMouseOver).
  on("mouseout", handleMouseOut);

  // iv) Add a legend

  var legendData = [];
  for (let i = 0; i <= Math.floor(maxTemp); i++) {
    legendData = [...legendData, i];
  }

  const rectLegendWidth = 500 / legendData.length;

  const paddingBottomLegend = paddingBottom / 2,
  legendHeight = rectHeight;

  svg.append('g').
  attr('id', 'legend').
  selectAll('rect').
  data(legendData).
  enter().
  append('rect').
  attr('x', (d, i) => paddingLeft + i * rectLegendWidth).
  attr('y', h - paddingBottomLegend).
  attr('height', legendHeight).
  attr('width', rectLegendWidth).
  attr('fill', (d, i) => linearScale(i)).
  attr('stroke', 'black');

  const legendScale = d3.scaleLinear().
  domain([0, 14]).
  range([paddingLeft, paddingLeft + legendData.length * rectLegendWidth]);

  const legendAxis = d3.axisBottom(legendScale);

  d3.select('#legend').
  append('g').
  attr('id', 'legend-axis').
  attr('transform', 'translate(0, ' + (h - paddingBottomLegend + legendHeight) + ')').
  call(legendAxis);

  // v) Finally, the tooltip functionalities

  const tooltip = d3.select(".SVGChart").
  append("div").
  attr("id", "tooltip").
  style("opacity", 0);

  function handleMouseOver(d, i) {
    tooltip.style("opacity", 1).
    attr("data-year", d.year).
    html('<b>' + d.year + ', ' + months[d.month - 1] + '</b>' +
    '<br>Temp: ' + (baseTemperature + d.variance).toFixed(2) +
    '<br>Variance: ' + d.variance).
    style("left", d3.event.pageX + 15 + "px").
    style("top", d3.event.pageY - 30 + "px");
  };

  function handleMouseOut(d, i) {
    tooltip.style("opacity", 0);
  };

};