React = require 'react'
Modal = React.createFactory(require('react-bootstrap').Modal)
ButtonToolbar = React.createFactory(require('react-bootstrap').ButtonToolbar)
Button = React.createFactory(require('react-bootstrap').Button)
ConfirmButtons = require '../../../../react/common/ConfirmButtons'

OrchestrationActionCreators = require '../../ActionCreators'

{div, p, strong} = React.DOM

RunOrchestration = React.createClass
  displayName: 'RunOrchestration'
  propTypes:
    orchestration: React.PropTypes.object.isRequired
    notify: React.PropTypes.bool

  getDefaultProps: ->
    notify: false

  getInitialState: ->
    isLoading: false

  render: ->
    Modal title: "Run orchestration #{@props.orchestration.get('name')}", onRequestHide: @props.onRequestHide,
      div className: 'modal-body',
        p null,
          'You are about to run the orchestration ',
           strong null, @props.orchestration.get('name'),
           ' manually and the notifications will be sent only to you.'
      div className: 'modal-footer',
        React.createElement ConfirmButtons,
          isSaving: @state.isLoading
          isDisabled: false
          saveLabel: 'Run'
          onCancel: @props.onRequestHide
          onSave: @_handleRun

  _handleRun: ->

    @setState
      isLoading: true

    OrchestrationActionCreators
    .runOrchestration(@props.orchestration.get('id'), @props.notify)
    .then(@props.onRequestHide)




module.exports = RunOrchestration
