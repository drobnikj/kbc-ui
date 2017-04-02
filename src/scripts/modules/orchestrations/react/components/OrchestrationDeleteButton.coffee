React = require 'react'
OrchestrationActionCreators = require '../../ActionCreators'

Router = require 'react-router'

Tooltip = React.createFactory(require('react-bootstrap').Tooltip)
OverlayTrigger = React.createFactory(require('react-bootstrap').OverlayTrigger)
Confirm = React.createFactory(require('../../../../react/common/Confirm').default)
Loader = React.createFactory(require('kbc-react-components').Loader)

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
        text: "Are you sure you want to move the configuration #{@props.orchestration.get('name')} to Trash?"
        buttonLabel: 'Move to Trash'
        onConfirm: @_deleteOrchestration
      ,
        OverlayTrigger
          overlay: Tooltip null, 'Move to Trash'
          key: 'delete'
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
