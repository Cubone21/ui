import {NEUTRALS, BLUES} from 'src/shared/constants/influxColors'

// Styles for all things Annotations
const annotationColor = '255,255,255'
const annotationDragColor = '107,223,255'
const zIndexWindow = '1'
const zIndexAnnotation = '3'
const zIndexAnnotationActive = '4'
const timestampFontSize = '14px'
const timestampFontWeight = '600'

export const flag = (mouseOver, dragging, hasDuration, isEndpoint) => {
  const baseStyle = {
    position: 'absolute',
    zIndex: '2',
  }
  let style = {
    ...baseStyle,
    top: '-3px',
    left: '-2px',
    width: '6px',
    height: '6px',
    backgroundColor: `rgb(${annotationColor})`,
    borderRadius: '50%',
    transition: 'background-color 0.25s ease, transform 0.25s ease',
  }

  if (hasDuration) {
    style = {
      ...baseStyle,
      top: '-6px',
      width: '0',
      height: '0',
      left: '0',
      border: '6px solid transparent',
      borderLeftColor: `rgb(${annotationColor})`,
      borderRightColor: 'transparent',
      borderRadius: '0',
      background: 'none',
      transition: 'border-left-color 0.25s ease, transform 0.25s ease',
      transformOrigin: '0% 50%',
    }
  }

  if (isEndpoint) {
    style = {
      ...baseStyle,
      top: '-6px',
      width: '0',
      height: '0',
      left: 'initial',
      right: '0',
      border: '6px solid transparent',
      borderRightColor: `rgb(${annotationColor})`,
      borderLeftColor: 'transparent',
      borderRadius: '0',
      background: 'none',
      transition: 'border-right-color 0.25s ease, transform 0.25s ease',
      transformOrigin: '100% 50%',
    }
  }

  if (dragging) {
    if (isEndpoint) {
      return {
        ...style,
        transform: 'scale(1.5,1.5)',
        borderRightColor: `rgb(${annotationDragColor})`,
        borderLeftColor: 'transparent',
      }
    }

    if (hasDuration) {
      return {
        ...style,
        transform: 'scale(1.5,1.5)',
        borderLeftColor: `rgb(${annotationDragColor})`,
        borderRightColor: 'transparent',
      }
    }

    return {
      ...style,
      transform: 'scale(1.5,1.5)',
      backgroundColor: `rgb(${annotationDragColor})`,
    }
  }

  if (mouseOver) {
    return {...style, transform: 'scale(1.5,1.5)'}
  }

  return style
}

export const clickArea = editing => ({
  position: 'absolute',
  top: '-8px',
  left: editing ? '-5px' : '-7px',
  width: editing ? '12px' : '16px',
  height: editing ? 'calc(100% + 8px)' : '16px',
  zIndex: '4',
  cursor: editing ? 'col-resize' : 'default',
  border: '1px blue solid',
})

export const tooltip = annotationState => {
  const {isDragging, isMouseOver} = annotationState
  const isVisible = isDragging || isMouseOver

  return {
    position: 'absolute',
    bottom: 'calc(100% + 6px)',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: NEUTRALS[0],
    zIndex: '3',
    padding: '6px 12px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    display: isVisible ? 'flex' : 'none',
    boxShadow: `0 0 10px 2px ${NEUTRALS[2]}`,
  }
}

export const tooltipItems = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}
export const tooltipTimestamp = {
  color: NEUTRALS[20],
  display: 'block',
  fontSize: timestampFontSize,
  fontWeight: timestampFontWeight,
}
export const tooltipInputContainer = {width: '100%', marginBottom: '4px'}
export const tooltipForm = {
  display: 'inline-flex',
  alignItems: 'center',
  flexWrap: 'nowrap',
  width: '100%',
}
export const tooltipInputButton = {marginLeft: '2px'}
export const tooltipInput = {flex: '1 0 0'}

export const annotation = (time, dygraph, isMouseOver, isDragging) => {
  // TODO: export and test this function
  const containerLeftPadding = 16
  const left = `${dygraph.toDomXCoord(time) + containerLeftPadding}px`
  const width = 2

  return {
    left,
    position: 'absolute',
    top: '8px',
    backgroundColor: `rgb(${isDragging
      ? annotationDragColor
      : annotationColor})`,
    height: 'calc(100% - 36px)',
    width: `${width}px`,
    transition: 'background-color 0.25s ease',
    transform: `translateX(-${width / 2}px)`, // translate should always be half with width to horizontally center the annotation pole
    visibility: 'visible',
    zIndex:
      isDragging || isMouseOver ? zIndexAnnotationActive : zIndexAnnotation,
  }
}

export const window = (anno, dygraph) => {
  // TODO: export and test this function
  const [startX, endX] = dygraph.xAxisRange()
  const containerLeftPadding = 16
  const startTime = +anno.startTime
  const endTime = +anno.endTime

  let windowStartXCoord = dygraph.toDomXCoord(startTime)
  let windowEndXCoord = dygraph.toDomXCoord(endTime)
  let visibility = 'visible'

  if (startTime < startX) {
    windowStartXCoord = dygraph.toDomXCoord(startX)
  }

  if (endTime > endX) {
    windowEndXCoord = dygraph.toDomXCoord(endX)
  }

  if (endTime < startX || startTime > endX) {
    visibility = 'hidden'
  }

  const windowWidth = windowEndXCoord - windowStartXCoord
  const isDurationNegative = windowWidth < 0
  const foo = isDurationNegative ? windowWidth : 0

  const left = `${windowStartXCoord + containerLeftPadding + foo}px`
  const width = `${Math.abs(windowWidth)}px`

  const gradientStartColor = `rgba(${annotationColor},0.15)`
  const gradientEndColor = `rgba(${annotationColor},0)`

  return {
    left,
    position: 'absolute',
    top: '8px',
    background: `linear-gradient(to bottom, ${gradientStartColor} 0%,${gradientEndColor} 100%)`,
    height: 'calc(100% - 36px)',
    borderTop: `2px dotted rgba(${annotationColor},0.35)`,
    width,
    zIndex: zIndexWindow,
    visibility,
  }
}

// Styles for new Annotations
export const newContainer = {
  position: 'absolute',
  zIndex: '9999',
  top: '8px',
  left: '16px',
  width: 'calc(100% - 32px)',
  height: 'calc(100% - 16px)',
  cursor: 'pointer',
}
export const newCrosshair = left => {
  const width = 2

  return {
    position: 'absolute',
    top: '0',
    left: `${left}px`,
    height: 'calc(100% - 20px)',
    width: `${width}px`,
    transform: `translateX(-${width / 2}px)`, // translate should always be half with width to horizontally center the comment pole
    background: `linear-gradient(to bottom, ${BLUES.hydrogen} 0%,${BLUES.pool} 100%)`,
    visibility: left ? 'visible' : 'hidden',
    transition: 'opacity 0.4s ease',
    zIndex: '5',
    cursor: 'pointer',
  }
}
export const newTooltip = isMouseHovering => {
  return {
    display: isMouseHovering ? 'flex' : 'none',
    flexDirection: 'column',
    alignItems: 'center',
    background: `linear-gradient(to bottom, ${BLUES.pool} 0%,${BLUES.ocean} 100%)`,
    borderRadius: '4px',
    padding: '6px 12px',
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '10',
  }
}
export const newHelper = {
  whiteSpace: 'nowrap',
  fontSize: '13px',
  lineHeight: '13px',
  fontWeight: '600',
  color: BLUES.neutrino,
  marginBottom: '4px',
}
export const newTimestamp = {
  whiteSpace: 'nowrap',
  fontSize: timestampFontSize,
  lineHeight: timestampFontSize,
  fontWeight: timestampFontWeight,
  color: NEUTRALS[20],
}
export const circleFlag = {
  position: 'absolute',
  zIndex: '2',
  top: '-3px',
  left: '-2px',
  width: '6px',
  height: '6px',
  backgroundColor: `rgb(${annotationDragColor})`,
  borderRadius: '50%',
  transition: 'background-color 0.25s ease, transform 0.25s ease',
}

export const leftFlag = {
  position: 'absolute',
  zIndex: '2',
  top: '-6px',
  width: '0',
  height: '0',
  left: '0',
  border: '6px solid transparent',
  borderLeftColor: `rgb(${annotationDragColor})`,
  borderRightColor: 'transparent',
  borderRadius: '0',
  background: 'none',
  transition: 'border-left-color 0.25s ease, transform 0.25s ease',
  transformOrigin: '0% 50%',
}
export const rightFlag = {
  position: 'absolute',
  zIndex: '2',
  top: '-6px',
  width: '0',
  height: '0',
  left: 'initial',
  right: '0',
  border: '6px solid transparent',
  borderRightColor: `rgb(${annotationDragColor})`,
  borderLeftColor: 'transparent',
  borderRadius: '0',
  background: 'none',
  transition: 'border-right-color 0.25s ease, transform 0.25s ease',
  transformOrigin: '100% 50%',
}

export const newWindow = (staticX, draggingX) => {
  // TODO: export and test this function

  const width = `${Math.abs(Number(draggingX) - Number(staticX))}px`

  let left

  if (draggingX > staticX) {
    left = `${staticX}px`
  } else {
    left = `${draggingX}px`
  }

  const gradientStartColor = `rgba(${annotationDragColor},0.15)`
  const gradientEndColor = `rgba(${annotationDragColor},0)`

  return {
    left,
    position: 'absolute',
    top: '0',
    background: `linear-gradient(to bottom, ${gradientStartColor} 0%,${gradientEndColor} 100%)`,
    height: 'calc(100% - 20px)',
    borderTop: `2px dotted rgba(${annotationDragColor},0.35)`,
    width,
    zIndex: '3',
    visibility: 'visible',
  }
}
