React = require 'react'
Immutable = require 'immutable'
classnames = require 'classnames'
{Map} = Immutable

createStoreMixin = require '../../../../../react/mixins/createStoreMixin'

storeProvisioning = require '../../../storeProvisioning'
RoutesStore = require '../../../../../stores/RoutesStore'
LatestJobsStore = require '../../../../jobs/stores/LatestJobsStore'

QueryTable = React.createFactory(require './QueryTable')
ComponentDescription = require '../../../../components/react/components/ComponentDescription'
ComponentMetadata = require '../../../../components/react/components/ComponentMetadata'

DeleteConfigurationButton = require '../../../../components/react/components/DeleteConfigurationButton'

LatestJobs = React.createFactory(require '../../../../components/react/components/SidebarJobs')
RunExtractionButton = React.createFactory(require '../../../../components/react/components/RunComponentButton')
Link = React.createFactory(require('react-router').Link)
SearchRow = require('../../../../../react/common/SearchRow').default
actionProvisioning = require '../../../actionsProvisioning'
LatestVersions = React.createFactory(require('../../../../components/react/components/SidebarVersionsWrapper').default)

{div, table, tbody, tr, td, ul, li, i, a, p, span, h2, p, strong, br, button} = React.DOM

module.exports = (componentId) ->
  actionCreators = actionProvisioning.createActions(componentId)
  return React.createClass
    displayName: 'ExDbIndex'
    mixins: [createStoreMixin(LatestJobsStore, storeProvisioning.componentsStore)]

    componentWillReceiveProps: ->
      @setState(@getStateFromStores())

    getStateFromStores: ->
      config = RoutesStore.getRouterState().getIn ['params', 'config']
      ExDbStore = storeProvisioning.createStore(componentId, config)
      queries = ExDbStore.getQueries()
      credentials = ExDbStore.getCredentials()

      #state
      configId: config
      pendingActions: ExDbStore.getQueriesPendingActions()
      latestJobs: LatestJobsStore.getJobs componentId, config
      hasCredentials: ExDbStore.hasValidCredentials(credentials)
      queries: queries
      queriesFilter: ExDbStore.getQueriesFilter()
      queriesFiltered: ExDbStore.getQueriesFiltered()
      hasEnabledQueries: queries.filter((query) -> query.get('enabled')).count() > 0

    _handleFilterChange: (query) ->
      actionCreators.setQueriesFilter(@state.configId, query)

    render: ->
      configurationId = @state.configId
      div className: 'container-fluid',
        div className: 'col-md-9 kbc-main-content',
          div className: 'row kbc-header',
            div className: 'col-sm-8',
              React.createElement ComponentDescription,
                componentId: componentId
                configId: @state.configId
            div className: 'col-sm-4 kbc-buttons',
              if @state.queries.count() >= 1
                Link
                  to: "ex-db-generic-#{componentId}-new-query"
                  params:
                    config: @state.configId
                  className: 'btn btn-success'
                ,
                  i className: 'kbc-icon-plus'
                  'New Export'
          if !@state.hasCredentials
            div className: 'row component-empty-state text-center',
              p null,
                'Please setup database credentials for this extractor.'
              Link
                to: "ex-db-generic-#{componentId}-credentials"
                params:
                  config: @state.configId
              ,
                button className: 'btn btn-success',
                  'Setup Database Credentials'
          if @state.queries.count() > 1
            React.createElement SearchRow,
              onChange: @_handleFilterChange
              query: @state.queriesFilter
              className: 'row kbc-search-row'
          if @state.queries.count()
            if @state.queriesFiltered.count()
              QueryTable
                queries: @state.queriesFiltered
                configurationId: @state.configId
                componentId: componentId
                pendingActions: @state.pendingActions
            else
              @_renderNotFound()
          else if @state.hasCredentials
            div className: 'row component-empty-state text-center',
              p null,
                'No queries configured yet.'
              Link
                to: "ex-db-generic-#{componentId}-new-query"
                params:
                  config: @state.configId
                className: 'btn btn-success'
              ,
                i className: 'kbc-icon-plus'
                'New Export'
        div className: 'col-md-3 kbc-main-sidebar',
          div className: 'kbc-buttons kbc-text-light',
            React.createElement ComponentMetadata,
              componentId: componentId
              configId: @state.configId

          ul className: 'nav nav-stacked',
            if @state.hasCredentials
              li null,
                Link
                  to: "ex-db-generic-#{componentId}-credentials"
                  params:
                    config: @state.configId
                ,
                  i className: 'fa fa-fw fa-user'
                  ' Database Credentials'
            li className: classnames(disabled: !@state.hasEnabledQueries),
              RunExtractionButton
                title: 'Run Extraction'
                component: componentId
                mode: 'link'
                disabled: !@state.hasEnabledQueries
                disabledReason: 'There are no queries to be executed.'
                runParams: ->
                  config: configurationId
              ,
                'You are about to run an extraction.'
            li null,
              React.createElement DeleteConfigurationButton,
                componentId: componentId
                configId: @state.configId

          LatestJobs
            limit: 3
            jobs: @state.latestJobs

          LatestVersions
            componentId: componentId
            limit: 3

    _renderNotFound: ->
      div {className: 'table table-striped'},
        div {className: 'tfoot'},
          div {className: 'tr'},
            div {className: 'td'}, 'No queries found'
