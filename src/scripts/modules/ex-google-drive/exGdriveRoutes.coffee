IntalledComponentsStore = require '../components/stores/InstalledComponentsStore'

ExGdriveIndex = require './react/pages/index/Index'
ExGoogleDriveActionCreators = require './exGdriveActionCreators'
sheetDetail = require './react/pages/sheet-detail/SheetDetail'
authorizePage = require './react/pages/authorize/authorize'
ExGdriveSheetHeaderButtons = require './react/components/SheetHeaderButtons'
sheetsPicker = require './react/pages/sheets-picker/SheetsPicker'
ExGdriveSheetSelectionHeader = require './react/components/SaveSelectedSheetsHeader'

module.exports =
  name: 'ex-google-drive'
  isComponent: true
  path: 'ex-google-drive/:config'
  defaultRouteHandler: ExGdriveIndex
  requireData: [
    (params) ->
      ExGoogleDriveActionCreators.loadConfiguration params.config
  ]

  title: (routerState) ->
    configId = routerState.getIn ['params', 'config']
    'Google Drive extractor - ' + IntalledComponentsStore.getConfig('ex-google-drive', configId).get 'name'

  childRoutes: [
    name: 'ex-google-drive-select-sheets'
    path: 'sheets'
    handler: sheetsPicker
    title: 'Select Sheets'
    headerButtonsHandler: ExGdriveSheetSelectionHeader
    requireData: [
      (params) ->
        nextPageToken = "" #load first page
        ExGoogleDriveActionCreators.loadGdriveFiles(params.config, nextPageToken)
    ]
  ,
    name: 'ex-google-drive-authorize'
    path: 'authorize'
    handler: authorizePage
    title: 'Authorize Google Drive account'
  ,
    name: 'ex-google-drive-sheet'
    path: 'sheet/:fileId/:sheetId'
    title: ->
      'sheet'
    handler: sheetDetail
    headerButtonsHandler: ExGdriveSheetHeaderButtons

  ]
