React = require 'react'
createStoreMixin = require '../../../../react/mixins/createStoreMixin.coffee'
ExDbStore = require '../../exDbStore.coffee'
RoutesStore = require '../../../../stores/RoutesStore.coffee'
ExDbActionCreators = require '../../exDbActionCreators.coffee'

Loader = React.createFactory(require '../../../../react/common/Loader.coffee')

{button, span} = React.DOM

module.exports = React.createClass
  displayName: 'CredentialsHeaderButtons'
  mixins: [createStoreMixin(ExDbStore)]

  componentWillReceiveProps: ->
    @setState(@getStateFromStores())

  getStateFromStores: ->
    configId = RoutesStore.getCurrentRouteParam 'config'
    currentConfigId: configId
    isEditing: ExDbStore.isEditingCredentials configId
    isSaving: ExDbStore.isSavingCredentials configId

  _handleEditStart: ->
    ExDbActionCreators.editCredentials @state.currentConfigId

  _handleCancel: ->
    ExDbActionCreators.cancelCredentialsEdit @state.currentConfigId

  _handleCreate: ->
    ExDbActionCreators.saveCredentialsEdit @state.currentConfigId

  render: ->
    if @state.isEditing
      React.DOM.div className: 'kbc-buttons',
        if @state.isSaving
          Loader()
        button
          className: 'btn btn-link'
          disabled: @state.isSaving
          onClick: @_handleCancel
        ,
          'Cancel'
        button
          className: 'btn btn-success'
          disabled: @state.isSaving
          onClick: @_handleCreate
        ,
          'Save'
    else
      React.DOM.div null,
        button
          className: 'btn btn-success'
          disabled: @state.isSaving
          onClick: @_handleEditStart
        ,
          span className: 'fa fa-edit'
          ' Edit Credentials'
