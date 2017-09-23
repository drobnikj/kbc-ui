React = require 'react'
DurationWithIcon = React.createFactory(require('../../../../../react/common/DurationWithIcon').default)
FinishedWithIcon = React.createFactory(require '../../../../../react/common/FinishedWithIcon')
JobStatusCircle = React.createFactory(require '../../../../../react/common/JobStatusCircle')
Link = React.createFactory(require('react-router').Link)
OrchestrationActiveButton = React.createFactory(require '../../components/OrchestrationActiveButton')
OrchestrationDeleteButton = React.createFactory(require '../../components/OrchestrationDeleteButton')
OrchestrationRunButton = React.createFactory(require('../../components/OrchestrationRunButton').default)
CronRecord = React.createFactory(require './../../components/CronRecord')
ImmutableRenderMixin = require '../../../../../react/mixins/ImmutableRendererMixin'

OrchestrationActionCreators = require '../../../ActionCreators'

{span, div, a, button, i} = React.DOM


OrchestrationRow = React.createClass(
  displayName: 'OrchestrationRow'
  mixins: [ImmutableRenderMixin]
  propTypes:
    orchestration: React.PropTypes.object
    pendingActions: React.PropTypes.object

  buttons: ->
    buttons = []

    buttons.push(OrchestrationDeleteButton(
      orchestration: @props.orchestration
      isPending: @props.pendingActions.get 'delete'
      key: 'delete'
    ))

    buttons.push(OrchestrationActiveButton(
      orchestration: @props.orchestration
      isPending: @props.pendingActions.get 'active'
      key: 'activate'
    ))

    buttons.push(OrchestrationRunButton(
      orchestration: @props.orchestration
      notify: true
      key: 'run'
    ))

    buttons

  render: ->
    lastExecutedJob = @props.orchestration.get('lastExecutedJob')
    if lastExecutedJob && lastExecutedJob.get 'startTime'
      duration = (DurationWithIcon
        startTime: lastExecutedJob.get('startTime')
        endTime: lastExecutedJob.get('endTime')
        )
    else
      duration = 'No run yet'

    (Link {className: "tr", to: 'orchestration', params: {orchestrationId: @props.orchestration.get('id')}},
      (span {className: 'td'},
        (JobStatusCircle {status: lastExecutedJob?.get('status')})
        ' '
        @props.orchestration.get('name')
      ),
      (span {className: 'td'},
        (FinishedWithIcon endTime: lastExecutedJob?.get('startTime')) if lastExecutedJob?.get('startTime')
      ),
      (span {className: 'td'},
        duration
      ),
      (span {className: 'td'},
        CronRecord
          crontabRecord: @props.orchestration.get 'crontabRecord'
      ),
      (span {className: 'td text-right kbc-no-wrap'},
        @buttons()
      )
    )
)

module.exports = OrchestrationRow
