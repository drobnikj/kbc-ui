###
  Delete button with confirm and loading state
###

React = require 'react'
classnames = require 'classnames'

Tooltip = React.createFactory(require('./Tooltip').default)
Loader = React.createFactory(require('@keboola/indigo-ui').Loader)
Confirm = React.createFactory(require('./Confirm').default)
trashUtils = require '../../modules/trash/utils.js'

assign = require 'object-assign'

{button, span, i} = React.DOM

module.exports = React.createClass
  displayName: 'DeleteButton'
  propTypes:
    tooltip: React.PropTypes.string
    confirm: React.PropTypes.object # Confirm props
    isPending: React.PropTypes.bool
    isEnabled: React.PropTypes.bool
    label: React.PropTypes.string
    pendingLabel: React.PropTypes.string
    fixedWidth: React.PropTypes.bool
    icon: React.PropTypes.string
    componentId: React.PropTypes.string

  getDefaultProps: ->
    tooltip: 'Delete'
    isPending: false
    isEnabled: true
    label: ''
    pendingLabel: ''
    fixedWidth: false
    icon: 'kbc-icon-cup'

  render: ->
    if @props.isPending
      React.DOM.span className: 'btn btn-link', disabled: true,
        Loader className: 'fa-fw'
        if @props.pendingLabel then ' ' + @props.pendingLabel
    else if !@props.isEnabled
      button className: 'btn btn-link disabled', disabled: true,
        i className: classnames('fa', @props.icon, 'fa-fw': @props.fixedWidth)
        if @props.label then ' ' + @props.label
    else
      if trashUtils.isObsoleteComponent(@props.componentId)
        Confirm assign({}, buttonLabel: 'Delete', @props.confirm),
          Tooltip
            tooltip: @props.tooltip
            id: 'delete'
            placement: 'top'
          ,
            button className: 'btn btn-link',
              i className: classnames('fa', @props.icon, 'fa-fw': @props.fixedWidth)
              if @props.label then ' ' + @props.label
      else
        Confirm assign({}, buttonLabel: 'Delete', @props.confirm),
          button className: 'btn btn-link', onClick: @props.confirm.onConfirm,
            i className: classnames('fa', @props.icon, 'fa-fw': @props.fixedWidth)
            if @props.label then ' ' + @props.label
