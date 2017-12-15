React = require 'react'
ImmutableRenderMixin = require '../../../../../react/mixins/ImmutableRendererMixin'

Link = React.createFactory(require('react-router').Link)
Check = React.createFactory(require('@keboola/indigo-ui').Check)
QueryDeleteButton = React.createFactory(require('../../../../ex-db-generic/react/components/QueryDeleteButton').default)
RunExtractionButton = React.createFactory(require '../../../../components/react/components/RunComponentButton')
SapiTableLinkEx = require('../../../../components/react/components/StorageApiTableLinkEx').default
ActivateDeactivateButton = React.createFactory(require('../../../../../react/common/ActivateDeactivateButton').default)

actionsProvisioning = require '../../../actionsProvisioning'

{span, div, a, button, i} = React.DOM

module.exports = React.createClass
  displayName: 'QueryRow'
  mixins: [ImmutableRenderMixin]
  propTypes:
    query: React.PropTypes.object.isRequired
    pendingActions: React.PropTypes.object.isRequired
    configurationId: React.PropTypes.string.isRequired
    componentId: React.PropTypes.string.isRequired

  _handleActiveChange: (newValue) ->
    actionCreators = actionsProvisioning.createActions(@props.componentId)
    actionCreators.changeQueryEnabledState(@props.configurationId, @props.query.get('id'), newValue)

  render: ->
    actionCreators = actionsProvisioning.createActions(@props.componentId)
    props = @props
    Link
      className: 'tr'
      to: "ex-db-generic-#{@props.componentId}-query"
      params:
        config: @props.configurationId
        query: @props.query.get 'id'
    ,
      span className: 'td kbc-break-all',
        if @props.query.get 'name'
          @props.query.get 'name'
        else
          span className: 'text-muted',
            'Untitled'
      span className: 'td',
        Check isChecked: @props.query.get 'incremental'
      span className: 'td text-right kbc-no-wrap',
        QueryDeleteButton
          query: @props.query
          configurationId: @props.configurationId
          isPending: @props.pendingActions.get 'deleteQuery'
          componentId: @props.componentId
          actionsProvisioning: actionsProvisioning
          entityName: 'Export'
        ActivateDeactivateButton
          activateTooltip: 'Enable Export'
          deactivateTooltip: 'Disable Export'
          isActive: @props.query.get('enabled')
          isPending: @props.pendingActions.get 'enabled'
          onChange: @_handleActiveChange
        RunExtractionButton
          title: 'Run Extraction'
          component: @props.componentId
          runParams: ->
            config: props.configurationId
            configData: actionCreators.prepareSingleQueryRunData(props.configurationId, props.query)
        ,
          'You are about to run an extraction.'
