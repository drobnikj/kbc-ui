React = require 'react'
OrchestrationActionCreators = require '../../ActionCreators'

Router = require 'react-router'

Tooltip = React.createFactory(require('./../../../../react/common/Tooltip').default)
Confirm = React.createFactory(require('../../../../react/common/Confirm').default)
Loader = React.createFactory(require('@keboola/indigo-ui').Loader)

{button, span, i} = React.DOM

###
  Enabled/Disabled orchestration button with tooltip
###
OrchestrationDeleteButton = React.createClass
  displayName: 'OrchestrationDeleteButton'
  mixins: [Router.Navigation]
  propTypes:
    orchestration: React.PropTypes.object.isRequired
    isPending: React.PropTypes.bool.isRequired
    tooltipPlacement: React.PropTypes.string

  getDefaultProps: ->
    tooltipPlacement: 'top'

  render: ->
    if @props.isPending
      span className: 'btn btn-link',
        Loader()
    else
      Confirm
        title: 'Move Configuration to Trash'
        text: [
          React.DOM.p key: 'question',
            "Are you sure you want to move the configuration #{@props.orchestration.get('name')} to Trash?",
          React.DOM.p key: 'warning',
            React.DOM.i className: 'fa fa-exclamation-triangle'
            " This configuration can't be restored."
        ]
        buttonLabel: 'Move to Trash'
        onConfirm: @_deleteOrchestration
      ,
        Tooltip
          tooltip: 'Move to Trash'
          id: 'delete'
          placement: @props.tooltipPlacement
        ,
          button className: 'btn btn-link',
            i className: 'kbc-icon-cup'

  _deleteOrchestration: ->
    @transitionTo 'orchestrations'
    # if orchestration is deleted immediately view is rendered with missing orchestration because of store changed
    id = @props.orchestration.get('id')
    setTimeout ->
      OrchestrationActionCreators.deleteOrchestration(id)

module.exports = OrchestrationDeleteButton
