React = require 'react'
ExDbActionCreators = require '../../exDbActionCreators'

Tooltip = React.createFactory(require('./../../../../react/common/Tooltip').default)
Confirm = React.createFactory(require('../../../../react/common/Confirm').default)
Loader = React.createFactory(require('@keboola/indigo-ui').Loader)
{Navigation} = require 'react-router'

{button, span, i} = React.DOM

###
  Enabled/Disabled orchestration button with tooltip
###
module.exports = React.createClass
  displayName: 'QueryDeleteButton'
  mixins: [Navigation]
  propTypes:
    query: React.PropTypes.object.isRequired
    configurationId: React.PropTypes.string.isRequired
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
        title: 'Delete Query'
        text: "Do you really want to delete the query #{@props.query.get('name')}?"
        buttonLabel: 'Delete'
        onConfirm: @_deleteQuery
      ,
        Tooltip
          tooltip: 'Delete Query'
          id: 'delete'
          placement: @props.tooltipPlacement
        ,
          button className: 'btn btn-link',
            i className: 'kbc-icon-cup'

  _deleteQuery: ->
    @transitionTo 'ex-db',
      config: @props.configurationId

    # if query is deleted immediately view is rendered with missing orchestration because of store changed
    id = @props.query.get('id')
    config = @props.configurationId
    setTimeout ->
      ExDbActionCreators.deleteQuery config, id
