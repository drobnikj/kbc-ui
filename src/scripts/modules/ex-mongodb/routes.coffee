React = require 'react'
IntalledComponentsStore = require '../components/stores/InstalledComponentsStore'
actionsProvisioning = require './actionsProvisioning'

ExDbIndex = require './react/pages/index/Index'

ExDbCredentialsPage = require('../ex-db-generic/react/pages/credentials/CredentialsPage').default
ExDbNewCredentialsPage = require('../ex-db-generic/react/pages/credentials/NewCredentialsPage').default

ExDbQueryDetail = require './react/pages/query-detail/QueryDetail'
ExDbNewQuery = require './react/pages/new-query/NewQuery'

ExDbNewQueryHeaderButtons = require('./react/components/NewQueryHeaderButtons').default
ExDbQueryHeaderButtons = require('../ex-db-generic/react/components/QueryActionButtons').default
ExDbCredentialsHeaderButtons = require('../ex-db-generic/react/components/CredentialsHeaderButtons').default
ExDbNewCredentialsHeaderButtons = require('../ex-db-generic/react/components/NewCredentialsHeaderButtons').default

ExDbQueryName = require('../ex-db-generic/react/components/QueryName').default

JobsActionCreators = require '../jobs/ActionCreators'
StorageActionCreators = require('../components/StorageActionCreators')
VersionsActionsCreators = require('../components/VersionsActionCreators')
{createTablesRoute} = require '../table-browser/routes'
storeProvisioning = require './storeProvisioning'

credentialsTemplate = require('../ex-db-generic/templates/credentials').default
hasSshTunnel = require('../ex-db-generic/templates/hasSshTunnel').default

module.exports = (componentId) ->
  name: componentId
  path: ':config'
  isComponent: true
  requireData: [
    (params) ->
      actionsProvisioning.loadConfiguration componentId, params.config
    (params) ->
      VersionsActionsCreators.loadVersions componentId, params.config
  ]
  title: (routerState) ->
    configId = routerState.getIn ['params', 'config']
    IntalledComponentsStore.getConfig(componentId, configId).get 'name'
  poll:
    interval: 5
    action: (params) ->
      JobsActionCreators.loadComponentConfigurationLatestJobs(componentId, params.config)
  defaultRouteHandler: ExDbIndex(componentId)
  childRoutes: [
    createTablesRoute(componentId)
  ,
    name: "ex-db-generic-#{componentId}-query"
    path: 'query/:query'
    title: (routerState) ->
      configId = routerState.getIn ['params', 'config']
      queryId = routerState.getIn ['params', 'query']
      ExDbStore = storeProvisioning.createStore(componentId, configId)
      'Query ' + ExDbStore.getConfigQuery(parseInt(queryId)).get 'name'
    nameEdit: (params) ->
      React.createElement ExDbQueryName(componentId, storeProvisioning),
        configId: params.config
        queryId: parseInt params.query
    requireData: [
      ->
        StorageActionCreators.loadTables()
    ]
    defaultRouteHandler: ExDbQueryDetail(componentId, actionsProvisioning, storeProvisioning)
    headerButtonsHandler: ExDbQueryHeaderButtons(
      componentId,
      actionsProvisioning,
      storeProvisioning,
      'Export'
    )
    childRoutes: [ createTablesRoute("ex-db-generic-#{componentId}-query")]
  ,
    name: "ex-db-generic-#{componentId}-new-query"
    path: 'new-query'
    title: ->
      'New export'
    requireData: [
      ->
        StorageActionCreators.loadTables()
    ]
    handler: ExDbNewQuery(componentId)
    headerButtonsHandler: ExDbNewQueryHeaderButtons(componentId, actionsProvisioning, storeProvisioning)
  ,
    name: "ex-db-generic-#{componentId}-credentials"
    path: 'credentials'
    title: ->
      'Credentials'
    handler: ExDbCredentialsPage(
      componentId, actionsProvisioning, storeProvisioning, credentialsTemplate, hasSshTunnel
    )
    headerButtonsHandler: ExDbCredentialsHeaderButtons(componentId, actionsProvisioning, storeProvisioning)
  ]
