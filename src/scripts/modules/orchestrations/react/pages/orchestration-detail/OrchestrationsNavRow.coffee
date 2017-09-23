React = require 'react'


DurationWithIcon = React.createFactory(require('../../../../../react/common/DurationWithIcon').default)
FinishedWithIcon = React.createFactory(require '../../../../../react/common/FinishedWithIcon')
JobStatusCircle = React.createFactory(require '../../../../../react/common/JobStatusCircle')
Link = React.createFactory(require('react-router').Link)

ImmutableRendererMixin = require '../../../../../react/mixins/ImmutableRendererMixin'

{ a, span, div, strong, em} = React.DOM

OrchestrationRow = React.createClass
  displayName: 'OrchestrationRow'
  propTypes:
    orchestration: React.PropTypes.object
    isActive: React.PropTypes.bool
  mixins: [ ImmutableRendererMixin]
  render: ->
    className = if @props.isActive then 'active' else ''

    if  !@props.orchestration.get('active')
      disabled = (span {className: 'pull-right kb-disabled'}, 'Disabled')
    else
      disabled = ''

    lastExecutedJob = @props.orchestration.get 'lastExecutedJob'
    if lastExecutedJob?.get('startTime')
      duration = DurationWithIcon
        startTime: lastExecutedJob.get('startTime')
        endTime: lastExecutedJob.get('endTime')
    else
      duration = ''

    Link
      className: "list-group-item #{className}"
      to: 'orchestration'
      params:
        orchestrationId: @props.orchestration.get('id')
    ,
      span className: 'table',
        span className: 'tr',
          span className: 'td kbc-td-status col-xs-1',
            JobStatusCircle status: lastExecutedJob?.get('status')
          span className: 'td',
            em null, disabled
            strong null, @props.orchestration.get('name')
            span null, duration
            span className: 'kb-info clearfix pull-right',
              (FinishedWithIcon endTime: lastExecutedJob.get('endTime')) if lastExecutedJob?.get('endTime')


module.exports = OrchestrationRow
