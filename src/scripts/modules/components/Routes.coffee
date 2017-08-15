#React = require 'react'

injectProps = require('./react/injectProps').default
ComponentsIndex = require('./react/pages/ComponentsIndex')
NewComponent = require('./react/pages/NewComponent').default

ComponentDetail = require './react/pages/component-detail/ComponentDetail'

ComponentReloaderButton = require './react/components/ComponentsReloaderButton'
ComponentsHeaderButtons = require './react/components/ComponentsHeaderButtons'
ComponentsStore = require './stores/ComponentsStore'
InstalledComponentsActionsCreators = require './InstalledComponentsActionCreators'
ComponentsActionCreators = require './ComponentsActionCreators'

exApifyRoutes = require('../apify/routes').default
exDbRoutes = require '../ex-db/exDbRoutes'
exDbGenericRoutes = require('../ex-db-generic/routes').default
exMongoDbRoutes = require '../ex-mongodb/routes'
exGoogleBigqueryRoutes = require('../ex-google-bigquery/routes').default
exGdriveGoogleRoutes = require '../ex-google-drive-old/exGdriveRoutes'
exGanalRoutes = require '../ex-google-analytics/exGanalRoutes'
exGaV4Routes = require('../ex-google-analytics-v4/routes').default
exFacebookRoutes = require('../ex-facebook/routes.js').default
exGdriveNewRoutes = require('../ex-google-drive/routes').default
csvImportRoutes = require('../csv-import/routes').default
exS3Routes = require('../ex-s3/routes').default
goodDataWriterRoutes = require '../gooddata-writer/routes'
dropoxExtractorRoutes = require('../ex-dropbox/routes').default
dropoxExtractorRoutesV2 = require('../ex-dropbox-v2/routes').default
dropoxWriterRoutes = require '../wr-dropbox/routes'
wrPortalCreateRouteFn = require('../wr-portal/Routes').default
createDbWriterRoutes = require '../wr-db/routes'

createGenericDetailRoute = require './createGenericDetailRoute'
createComponentRoute = require('./createComponentRoute').default

googleDriveWriterRoutes = require '../wr-google-drive-old/wrGdriveRoutes'
googleDriveWriterNewRoutes = require('../wr-google-drive/routes').default
googleSheetsWriterRoutes = require('../wr-google-sheets/routes').default
tdeRoutes = require '../tde-exporter/tdeRoutes'
adformRoutes = require('../ex-adform/routes').default
twitterRoutes = require('../ex-twitter/routes').default
geneeaGeneralRoutes = require('../app-geneea-nlp-analysis/routes').default
geneeaV2Routes = require('../geneea-nlp-analysis-v2/routes').default
customScienceRoutes = require('../custom-science/Routes').default

extractor = injectProps(type: 'extractor')
writer = injectProps(type: 'writer')
application = injectProps(type: 'application')


routes =

  applications:
    name: 'applications'
    title: 'Applications'
    requireData: ->
      InstalledComponentsActionsCreators.loadComponents()
    defaultRouteHandler: application(ComponentsIndex)
    headerButtonsHandler: injectProps(
      addRoute: 'new-application'
      type: 'application'
    )(ComponentsHeaderButtons)
    reloaderHandler: ComponentReloaderButton
    childRoutes: [
      name: 'new-application'
      title: 'New Application'
      defaultRouteHandler: application(NewComponent)
    ,
      createComponentRoute 'geneea-nlp-analysis', [geneeaGeneralRoutes]
    ,
      createComponentRoute 'geneea.nlp-analysis-v2', [geneeaV2Routes]
    ,
      createComponentRoute 'custom-science', [customScienceRoutes]
    ,
      createGenericDetailRoute 'application'
    ]

  extractors:
    name: 'extractors'
    title: 'Extractors'
    requireData: ->
      InstalledComponentsActionsCreators.loadComponents()
    defaultRouteHandler: extractor(ComponentsIndex)
    headerButtonsHandler: injectProps(
      addRoute: 'new-extractor'
      type: 'extractor'
    )(ComponentsHeaderButtons)
    reloaderHandler: ComponentReloaderButton
    childRoutes: [
      name: 'new-extractor'
      title: 'New Extractor'
      defaultRouteHandler: extractor(NewComponent)
    ,
      createComponentRoute 'ex-db', [exDbRoutes]
    ,
      createComponentRoute 'ex-google-drive', [exGdriveGoogleRoutes]
    ,
      createComponentRoute 'ex-google-analytics', [exGanalRoutes]
      createComponentRoute 'keboola.ex-google-analytics-v4', [exGaV4Routes('keboola.ex-google-analytics-v4')]
      createComponentRoute 'keboola.ex-google-analytics', [exGaV4Routes('keboola.ex-google-analytics')]
      createComponentRoute 'keboola.ex-facebook', [exFacebookRoutes('keboola.ex-facebook')]
      createComponentRoute 'keboola.ex-facebook-ads', [exFacebookRoutes('keboola.ex-facebook-ads')]
      createComponentRoute 'keboola.ex-google-drive', [exGdriveNewRoutes]
    ,
      createComponentRoute 'ex-adform', [adformRoutes]
    ,
      createComponentRoute 'keboola.ex-twitter', [twitterRoutes]
    ,
      createComponentRoute 'ex-dropbox', [dropoxExtractorRoutes]
    ,
      createComponentRoute 'radektomasek.ex-dropbox-v2', [dropoxExtractorRoutesV2]
    ,
      createComponentRoute 'keboola.ex-db-pgsql', [exDbGenericRoutes('keboola.ex-db-pgsql')]
      createComponentRoute 'keboola.ex-db-redshift', [exDbGenericRoutes('keboola.ex-db-redshift')]
      createComponentRoute 'keboola.ex-db-firebird', [exDbGenericRoutes('keboola.ex-db-firebird')]
      createComponentRoute 'keboola.ex-db-db2', [exDbGenericRoutes('keboola.ex-db-db2')]
      createComponentRoute 'keboola.ex-db-db2-bata', [exDbGenericRoutes('keboola.ex-db-db2-bata')]
      createComponentRoute 'keboola.ex-db-mssql', [exDbGenericRoutes('keboola.ex-db-mssql')]
      createComponentRoute 'keboola.ex-db-mysql', [exDbGenericRoutes('keboola.ex-db-mysql')]
      createComponentRoute 'keboola.ex-db-mysql-custom', [exDbGenericRoutes('keboola.ex-db-mysql-custom')]
      createComponentRoute 'keboola.ex-db-oracle', [exDbGenericRoutes('keboola.ex-db-oracle')]
      createComponentRoute 'keboola.ex-db-snowflake', [exDbGenericRoutes('keboola.ex-db-snowflake')]
    ,
      createComponentRoute 'keboola.ex-db-impala', [exDbGenericRoutes('keboola.ex-db-impala')]
    ,
      createComponentRoute 'keboola.ex-mongodb', [exMongoDbRoutes('keboola.ex-mongodb')]
    ,
      createComponentRoute 'keboola.ex-google-bigquery', [exGoogleBigqueryRoutes]
    ,
      createComponentRoute 'keboola.csv-import', [csvImportRoutes]
      createComponentRoute 'keboola.ex-s3', [exS3Routes]
      createComponentRoute 'apify.apify', [exApifyRoutes]
    ,
      createGenericDetailRoute 'extractor'

    ]

  writers:
    name: 'writers'
    title: 'Writers'
    requireData: ->
      InstalledComponentsActionsCreators.loadComponents()
    defaultRouteHandler: writer(ComponentsIndex)
    headerButtonsHandler: injectProps(
      addRoute: 'new-writer'
      type: 'writer'
    )(ComponentsHeaderButtons)
    reloaderHandler: ComponentReloaderButton
    childRoutes: [
      name: 'new-writer'
      title: 'New Writer'
      defaultRouteHandler: writer(NewComponent)
    ,
      createComponentRoute 'gooddata-writer', [goodDataWriterRoutes]
    ,
      createComponentRoute 'wr-dropbox', [dropoxWriterRoutes('wr-dropbox')]
    ,
      createComponentRoute 'keboola.wr-vizable', [dropoxWriterRoutes('keboola.wr-vizable')]
    ,
      createComponentRoute 'tde-exporter', [tdeRoutes]
    ,
      createComponentRoute 'wr-google-drive', [googleDriveWriterRoutes]
    ,
      createComponentRoute 'keboola.wr-google-sheets', [googleSheetsWriterRoutes]
    ,
      createComponentRoute 'keboola.wr-google-drive', [googleDriveWriterNewRoutes]
    ,
      createComponentRoute 'wr-db', [createDbWriterRoutes('wr-db', 'mysql', false)]
    ,
      createComponentRoute 'wr-db-mysql', [createDbWriterRoutes('wr-db-mysql', 'mysql', false)]
    ,
      createComponentRoute 'wr-db-oracle', [createDbWriterRoutes('wr-db-oracle', 'oracle', false)]
    ,
      createComponentRoute 'wr-db-redshift', [createDbWriterRoutes('wr-db-redshift', 'redshift', true)]
    ,
      createComponentRoute 'keboola.wr-looker', [createDbWriterRoutes('keboola.wr-looker', 'redshift', true)]
    ,
      createComponentRoute 'keboola.wr-qlik', [createDbWriterRoutes('keboola.wr-qlik', 'redshift', true)]
    ,
      createComponentRoute 'wr-tableau', [createDbWriterRoutes('wr-tableau', 'mysql', false)]
    ,
      createComponentRoute 'wr-db-mssql', [createDbWriterRoutes('wr-db-mssql', 'mssql', false)]
      createComponentRoute 'keboola.wr-db-mssql-v2', [createDbWriterRoutes('keboola.wr-db-mssql-v2', 'mssql', false)]
      createComponentRoute 'keboola.wr-redshift-v2', [createDbWriterRoutes('keboola.wr-redshift-v2', 'redshift', true)]
      createComponentRoute 'keboola.wr-db-impala', [createDbWriterRoutes('keboola.wr-db-impala', 'impala', false)]
      createComponentRoute 'keboola.wr-db-mysql', [createDbWriterRoutes('keboola.wr-db-mysql', 'mysql', false)]
      createComponentRoute 'keboola.wr-db-oracle', [createDbWriterRoutes('keboola.wr-db-oracle', 'oracle', false)]
      createComponentRoute 'keboola.wr-db-pgsql', [createDbWriterRoutes('keboola.wr-db-pgsql', 'pgsql', false)]
      createComponentRoute(
        'keboola.wr-db-snowflake',
        [createDbWriterRoutes('keboola.wr-db-snowflake', 'snowflake', true)]
      )
    ,
      createComponentRoute 'wr-portal-sas', [wrPortalCreateRouteFn('wr-portal-sas')]
    ,
      createComponentRoute 'keboola.wr-portal-periscope', [wrPortalCreateRouteFn('keboola.wr-portal-periscope')]
    ,
      createGenericDetailRoute 'writer'

    ]

module.exports = routes
