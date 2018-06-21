import React, {Component} from 'react'
import _ from 'lodash'

import Container from 'src/shared/components/overlay/OverlayContainer'
import Heading from 'src/shared/components/overlay/OverlayHeading'
import Body from 'src/shared/components/overlay/OverlayBody'
import SeverityConfig from 'src/logs/components/SeverityConfig'
import {SeverityLevel, SeverityColor} from 'src/types/logs'
import {DEFAULT_SEVERITY_LEVELS} from 'src/logs/constants'

interface Props {
  severityLevels: SeverityLevel[]
  onUpdateSeverityLevels: (severityLevels: SeverityLevel[]) => void
  onDismissOverlay: () => void
}

interface State {
  workingSeverityLevels: SeverityLevel[]
}

class OptionsOverlay extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      workingSeverityLevels: this.props.severityLevels,
    }
  }

  public render() {
    const {workingSeverityLevels} = this.state

    return (
      <Container maxWidth={700}>
        <Heading title="Configure Log Viewer">
          {this.overlayActionButtons}
        </Heading>
        <Body>
          <div className="row">
            <div className="col-sm-6">
              <SeverityConfig
                configs={workingSeverityLevels}
                onReset={this.handleResetSeverityLevels}
                onChangeSeverityLevel={this.handleChangeSeverityLevel}
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label">Order Table Columns</label>
              <p>Column re-ordering goes here</p>
            </div>
          </div>
        </Body>
      </Container>
    )
  }

  private get overlayActionButtons(): JSX.Element {
    const {onDismissOverlay} = this.props

    return (
      <div className="btn-group--right">
        <button className="btn btn-sm btn-default" onClick={onDismissOverlay}>
          Cancel
        </button>
        <button
          className="btn btn-sm btn-success"
          onClick={this.handleSave}
          disabled={this.isSaveDisabled}
        >
          Save
        </button>
      </div>
    )
  }

  private get isSaveDisabled(): boolean {
    const {workingSeverityLevels} = this.state
    const {severityLevels} = this.props

    if (_.isEqual(workingSeverityLevels, severityLevels)) {
      return true
    }

    return false
  }

  private handleSave = () => {
    const {onUpdateSeverityLevels, onDismissOverlay} = this.props
    const {workingSeverityLevels} = this.state

    onUpdateSeverityLevels(workingSeverityLevels)
    onDismissOverlay()
  }

  private handleResetSeverityLevels = (): void => {
    this.setState({workingSeverityLevels: DEFAULT_SEVERITY_LEVELS})
  }

  private handleChangeSeverityLevel = (severity: string) => (
    override: SeverityColor
  ): void => {
    const workingSeverityLevels = this.state.workingSeverityLevels.map(
      config => {
        if (config.severity === severity) {
          return {...config, override}
        }

        return config
      }
    )

    this.setState({workingSeverityLevels})
  }
}

export default OptionsOverlay
