React = require 'react'
_ = require 'underscore'

ConfirmButtons = require('../../../../../react/common/ConfirmButtons').default
SapiTableSelector = require('../../../../components/react/components/SapiTableSelector').default

Picker = React.createFactory(require('../../../../google-utils/react/GooglePicker').default)
ViewTemplates = require('../../../../google-utils/react/PickerViewTemplates').default

{label, a, small, button, option, span, i, button, strong, div, input} = React.DOM
Input = React.createFactory(require('./../../../../../react/common/KbcBootstrap').Input)
Modal = require('react-bootstrap').Modal
Loader = React.createFactory(require('kbc-react-components').Loader)
SapiTableLinkEx = React.createFactory(require('../../../../components/react/components/StorageApiTableLinkEx').default)
ModalHeader = React.createFactory(require('react-bootstrap').Modal.Header)
ModalTitle = React.createFactory(require('react-bootstrap').Modal.Title)
ModalBody = React.createFactory(require('react-bootstrap').Modal.Body)
ModalFooter = React.createFactory(require('react-bootstrap').Modal.Footer)

tooltips =
  file: 'uploads the selected table as a csv file'
  sheet: 'uploads the selected table as a google drive spreadsheet'
  update: 'always update the same file or sheet; if it does not exist, create one'
  create: 'always create new files with a unique name by appending the current date and time to the name.'


module.exports = React.createClass
  displayName: 'RowEditor'
  propTypes:
    editFn: React.PropTypes.func.isRequired
    table: React.PropTypes.object
    editData: React.PropTypes.object.isRequired
    isSavingFn: React.PropTypes.func.isRequired
    email: React.PropTypes.string.isRequired
    googleInfo: React.PropTypes.object
    saveFn: React.PropTypes.func.isRequired
    updateGoogleFolderFn: React.PropTypes.func.isRequired
    renderToModal: React.PropTypes.bool.isRequired
    configuredTableIds: React.PropTypes.array.isRequired

  getStateFromStores: ->
    isTablesLoading = storageTablesStore.getIsLoading()
    tables = storageTablesStore.getAll()

    #state
    isTablesLoading: isTablesLoading
    tables: tables

  getDefaultProps: ->
    configuredTableIds: []

  render: ->
    if @props.renderToModal
      return @_renderToModal()

    div className: 'tr',
      span className: 'td',
        SapiTableLinkEx tableId: @props.table.get('id'),
          @props.table.get 'name'
      span className: 'td',
        i className: 'kbc-icon-arrow-right'
      span className: 'td',
        @_renderTitleInput()
      span className: 'td',
        @_renderSelect(['update', 'create'], 'operation')
      span className: 'td',
        @_renderSelect(['sheet', 'file'], 'type')
      span className: 'td',
        @_renderPicker()
      span className: 'td text-right kbc-no-wrap',
        if @_isSaving()
          Loader()
        @_renderCancelButton()
        @_renderSaveButton()

  _renderToModal: ->
    operationSelect = @_renderSelect(['update', 'create'], 'operation')
    typeSelect = @_renderSelect(['sheet', 'file'], 'type')
    React.createElement Modal,
      onHide: =>
        @_cancel()
      show: true
      ModalHeader closeButton: true,
        ModalTitle null,
          'Add New Table'
      ModalBody null,
        div className: 'form-horizontal clearfix',
          div className: 'row col-md-12',
            @_renderFormControl('Storage Table', @_renderTableSelector())
            @_renderFormControl('Title Table', @_renderTitleInput())
            @_renderFormControl('Operation', operationSelect)
            @_renderFormControl('Type', typeSelect)
            @_renderFormControl('Folder', @_renderPicker())
      ModalFooter null,
        React.createElement ConfirmButtons,
          isSaving: @_isSaving()
          isDisabled: @_isSaving() or (not @_isValid())
          saveLabel: 'Save'
          onCancel: @_cancel
          onSave: @_startSaving

  _isValid: ->
    !! (@props.editData.get('tableId') and @props.editData.get('title'))

  _isSaving: ->
    @props.isSavingFn(@props.editData.get('tableId'))

  _renderFormControl: (controlLabel, control) ->
    div className: 'form-group',
      label className: 'col-xs-3 control-label', controlLabel
      div className: 'col-xs-9',
        control


  _cancel: ->
    @props.editFn(null)


  _renderSaveButton: ->
    isValid = @props.editData.get('tableId') and @props.editData.get('title')
    className = 'btn btn-success btn-sm'
    if @props.renderToModal
      className = 'btn btn-success'
    button
      className: className
      onClick: @_startSaving
      disabled: (not isValid) or @_isSaving()
    ,
      'Save'

  _renderCancelButton: ->
    className = 'btn btn-link btn-sm'
    if @props.renderToModal
      className = 'btn btn-link'
    button
      className: className
      onClick: @_cancel
      disabled: @_isSaving()
    ,
      'Cancel'


  _renderTableSelector: ->
    React.createElement SapiTableSelector,
      placeholder: 'source table'
      value: @props.editData.get 'tableId'
      onSelectTableFn: (newValue) =>
        newData = @props.editData.set 'tableId', newValue
        @props.editFn(newData)
      excludeTableFn: (tableId) =>
        tableId in @props.configuredTableIds


  _renderTitleInput: ->
    bsize = 'small'
    if @props.renderToModal
      bsize = 'medium'
    Input
      value: @props.editData?.get 'title'
      bsSize: bsize
      type: 'text'
      onChange: (event) =>
        data = event.target.value
        editData = @props.editData.set 'title', data
        @props.editFn(editData)


  _startSaving: ->
    @props.saveFn(@props.editData).then =>
      @props.editFn(null)

  _renderPicker: ->
    file = @props.editData
    bsize = 'small'
    if @props.renderToModal
      bsize = 'medium'
    folderId = file.get 'targetFolder' if file
    folderName = @props.googleInfo?.get(folderId).get 'title' if folderId
    Picker
      email: @props.email
      dialogTitle: 'Select a folder'
      buttonLabel: folderName or '/'
      onPickedFn: (data) =>
        data = _.filter data, (file) ->
          file.type == 'folder'
        folderId = data[0].id
        folderName = data[0].name
        data[0].title = folderName
        @props.updateGoogleFolderFn(data[0], folderId)
        data = @props.editData.set('targetFolder', folderId)
        @props.editFn(data)
      buttonProps:
        bsStyle: 'default'
        bsSize: bsize
      views: [
        ViewTemplates.rootFolder
        ViewTemplates.sharedFolders
        ViewTemplates.starredFolders
        ViewTemplates.recent
      ]

  _renderSelect: (options, prop) ->
    bsize = 'small'
    if @props.renderToModal
      bsize = 'medium'

    return Input
      bsSize: bsize
      type: 'select'
      value: @props.editData?.get(prop) or options[0]
      onChange: (e) =>
        value = e.target.value
        data = @props.editData.set(prop, value)
        @props.editFn(data)
    ,
      _.map(options, (label) ->
        option
          title: tooltips[label]
          value: label
          key: label
        ,
          label
        )
