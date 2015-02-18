React = require 'react'
_ = require 'underscore'

Tooltip = React.createFactory(require('react-bootstrap').Tooltip)
OverlayTrigger = React.createFactory(require('react-bootstrap').OverlayTrigger)
Button = React.createFactory(require('react-bootstrap').Button)
Loader = React.createFactory(require '../../react/common/Loader')

{div, span, i, textarea} = React.DOM

StaticArea = React.createFactory React.createClass
  displayName: 'InlineEditAreaStatic'
  propTypes:
    text: React.PropTypes.string
    placeholder: React.PropTypes.string
    editTooltip: React.PropTypes.string
    onCancel: React.PropTypes.func

  render: ->
    props = _.omit @props, 'text'
    OverlayTrigger
      overlay: Tooltip null, @props.editTooltip
      placement: 'top'
    ,
      span props,
        if @props.text
          span null,
            @props.text
        else
          span className: 'text-muted',
            @props.placeholder
        ' '
        i className: 'fa fa-edit text-muted'

EditArea = React.createFactory React.createClass
  displayName: 'InlineEditAreaEdit'
  propTypes:
    text: React.PropTypes.string
    isSaving: React.PropTypes.bool
    placeholder: React.PropTypes.string
    onCancel: React.PropTypes.func
    onSave: React.PropTypes.func
    onChange: React.PropTypes.func

  _onChange: (e) ->
    @props.onChange e.target.value

  componentDidMount: ->
    @refs.textArea.getDOMNode().focus()

  render: ->
    div className: 'form-horizontal',
      div className: 'form-group',
        textarea(
          ref: 'textArea'
          value: @props.text
          disabled: @props.isSaving
          placeholder: @props.placeholder
          onChange: @_onChange
          className: 'form-control'
        ),
      div className: 'form-group',
        div className: 'kbc-buttons',
          Button
            bsStyle: 'link'
            disabled: @props.isSaving
            onClick: @props.onCancel
          ,
            'Cancel'
          Button
            bsStyle: 'primary'
            disabled: @props.isSaving
            onClick: @props.onSave
          ,
            'Save'
          if @props.isSaving
            span null,
              ' '
              Loader()


module.exports = React.createClass
  displayName: 'InlineEditArea'
  propTypes:
    onEditStart: React.PropTypes.func.isRequired
    onEditCancel: React.PropTypes.func.isRequired
    onEditChange: React.PropTypes.func.isRequired
    onEditSubmit: React.PropTypes.func.isRequired
    text: React.PropTypes.string
    isSaving: React.PropTypes.bool
    isEditing: React.PropTypes.bool
    editTooltip: React.PropTypes.string
    placeholder: React.PropTypes.string

  getDefaultProps: ->
    placeholder: 'Click to edit'
    editTooltip: 'Click to edit'
    isSaving: false

  render: ->
    if @props.isEditing
      EditArea
        text: @props.text
        isSaving: @props.isSaving
        placeholder: @props.placeholder
        onChange: @props.onEditChange
        onCancel: @props.onEditCancel
        onSave: @props.onEditSubmit
    else
      StaticArea
        text: @props.text
        editTooltip: @props.editTooltip
        placeholder: @props.placeholder
        onClick: @props.onEditStart

