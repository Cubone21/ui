/* eslint-disable no-magic-numbers */
import React, {Component, PropTypes} from 'react'
import Dygraphs from 'src/external/dygraph'
import getRange from 'src/shared/parsing/getRangeForDygraph'
import uuid from 'node-uuid'
import classnames from 'classnames'

const LINE_COLORS = [
  '#00C9FF',
  '#9394FF',
  '#4ED8A0',
  '#ff0054',
  '#ffcc00',
  '#33aa99',
  '#9dfc5d',
  '#92bcc3',
  '#ca96fb',
  '#ff00f0',
  '#38b94a',
  '#3844b9',
  '#a0725b',
]

export default class Dygraph extends Component {
  constructor(props) {
    super(props)
    this.state = {
      synced: false,
      legendHidden: true,
    }
    this.id = uuid.v4()
    console.log(this.id)
    this.getTimeSeries = ::this.getTimeSeries
    this.sync = ::this.sync
  }

  static defaultProps = {
    containerStyle: {},
    isGraphFilled: true,
    overrideLineColors: null,
    legendOnBottom: false,
  }

  getTimeSeries() {
    const {timeSeries} = this.props
    // Avoid 'Can't plot empty data set' errors by falling back to a
    // default dataset that's valid for Dygraph.
    return timeSeries.length ? timeSeries : [[0]]
  }

  componentDidMount() {
    const timeSeries = this.getTimeSeries()
    // dygraphSeries is a legend label and its corresponding y-axis e.g. {legendLabel1: 'y', legendLabel2: 'y2'};
    const {
      ranges,
      dygraphSeries,
      ruleValues,
      legendOnBottom,
      overrideLineColors,
      isGraphFilled,
      options,
    } = this.props

    const graphContainerNode = this.graphContainer
    const legendContainerNode = this.legendContainer
    let finalLineColors = overrideLineColors

    if (finalLineColors === null) {
      finalLineColors = LINE_COLORS
    }

    const defaultOptions = {
      plugins: [
        new Dygraphs.Plugins.Crosshair({
          direction: 'vertical',
        }),
      ],
      labelsSeparateLines: false,
      labelsDiv: legendContainerNode,
      labelsKMB: true,
      hideOverlayOnMouseOut: false,
      rightGap: 0,
      highlightSeriesBackgroundAlpha: 1.0,
      highlightSeriesBackgroundColor: 'rgb(41, 41, 51)',
      fillGraph: isGraphFilled,
      axisLineWidth: 2,
      gridLineWidth: 1,
      highlightCircleSize: 3,
      animatedZooms: true,
      colors: finalLineColors,
      series: dygraphSeries,
      axes: {
        y: {
          valueRange: getRange(timeSeries, ranges.y, ruleValues),
        },
        y2: {
          valueRange: getRange(timeSeries, ranges.y2),
        },
      },
      highlightSeriesOpts: {
        strokeWidth: 2,
        highlightCircleSize: 5,
      },
      unhighlightCallback: e => {
        // console.log('hey on', e)
        this.setState({legendHidden: true}, () => {
          console.log(
            'unhighlightCallback. legendHidden:',
            this.state.legendHidden,
            this.id
          )
        })
      },
      highlightCallback: (e, x, points, row, seriesName) => {
        console.log('seriesName', seriesName)
        this.setState({legendHidden: false}, () => {
          console.log(
            'highlightCallback. legendHidden:',
            this.state.legendHidden,
            this.id
          )
          // Move the Legend on hover
          const graphRect = graphContainerNode.getBoundingClientRect()
          const legendRect = legendContainerNode.getBoundingClientRect()
          const graphWidth = graphRect.width + 32 // Factoring in padding from parent
          const legendWidth = legendRect.width
          const legendHeight = legendRect.height
          const screenHeight = window.innerHeight
          const legendMaxLeft = graphWidth - legendWidth / 2
          const trueGraphX = e.pageX - graphRect.left
          let legendTop = graphRect.height + 0
          let legendLeft = trueGraphX
          console.log('graphRect.top', graphRect.top)

          // Enforcing max & min legend offsets
          if (trueGraphX < legendWidth / 2) {
            legendLeft = legendWidth / 2
          } else if (trueGraphX > legendMaxLeft) {
            legendLeft = legendMaxLeft
          }

          // Enforcing overflow of legend contents
          if (graphRect.bottom + legendHeight > screenHeight) {
            legendTop = graphRect.top - legendHeight
          }

          legendContainerNode.style.left = `${legendLeft}px`
          if (legendOnBottom) {
            legendContainerNode.style.bottom = '4px'
          } else {
            legendContainerNode.style.top = `${legendTop}px`
          }
        })
      },
    }

    this.dygraph = new Dygraphs(graphContainerNode, timeSeries, {
      ...defaultOptions,
      ...options,
    })

    this.sync()
  }

  componentWillUnmount() {
    this.dygraph.destroy()
    delete this.dygraph
  }

  componentDidUpdate() {
    const {labels, ranges, options, dygraphSeries, ruleValues} = this.props
    const dygraph = this.dygraph
    if (!dygraph) {
      throw new Error(
        'Dygraph not configured in time; this should not be possible!'
      )
    }

    const timeSeries = this.getTimeSeries()

    dygraph.updateOptions({
      labels,
      file: timeSeries,
      axes: {
        y: {
          valueRange: getRange(timeSeries, ranges.y, ruleValues),
        },
        y2: {
          valueRange: getRange(timeSeries, ranges.y2),
        },
      },
      stepPlot: options.stepPlot,
      stackedGraph: options.stackedGraph,
      underlayCallback: options.underlayCallback,
      series: dygraphSeries,
    })

    dygraph.resize()
  }

  sync() {
    if (this.props.synchronizer && !this.state.synced) {
      this.props.synchronizer(this.dygraph)
      this.setState({synced: true})
    }
  }

  render() {
    console.log('render. legendHidden:', this.state.legendHidden, this.id)
    // const display = this.state.legendHidden ? 'block' : 'none'
    return (
      <div style={{height: '100%'}}>
        <div
          ref={r => {
            this.graphContainer = r
          }}
          style={this.props.containerStyle}
        />
        <div
          className={classnames({
            'container--dygraph-legend': true,
            hidden: this.state.legendHidden,
          })}
          ref={r => {
            this.legendContainer = r
          }}
        />
      </div>
    )
  }
}

const {array, arrayOf, func, number, bool, shape, string} = PropTypes

Dygraph.propTypes = {
  ranges: shape({
    y: arrayOf(number),
    y2: arrayOf(number),
  }),
  timeSeries: array.isRequired,
  labels: array.isRequired,
  options: shape({}),
  containerStyle: shape({}),
  isGraphFilled: bool,
  overrideLineColors: array,
  dygraphSeries: shape({}).isRequired,
  ruleValues: shape({
    operator: string,
    value: string,
    rangeValue: string,
  }),
  legendOnBottom: bool,
  synchronizer: func,
}
