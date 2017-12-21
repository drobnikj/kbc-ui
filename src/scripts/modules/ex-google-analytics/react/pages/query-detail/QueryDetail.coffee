React = require 'react'
_ = require 'underscore'
exGanalStore = require('../../../exGanalStore')
createStoreMixin = require '../../../../../react/mixins/createStoreMixin'
ExGanalActionCreators  = require '../../../exGanalActionCreators'
RoutesStore = require '../../../../../stores/RoutesStore'
QueryEditor = React.createFactory(require '../../components/QueryEditor')

{div, form, caption, input, label} = React.DOM
module.exports = React.createClass
  displayName: 'ExGanalQueryDetail'
  mixins: [createStoreMixin(exGanalStore)]

  getStateFromStores: ->
    configId = RoutesStore.getRouterState().getIn ['params', 'config']
    name = RoutesStore.getRouterState().getIn ['params', 'name']
    config = exGanalStore.getConfig(configId)
    configId: configId
    query: exGanalStore.getQuery(configId, name)
    editingQuery: exGanalStore.getEditingQuery(configId, name)
    name: name
    isEditing: exGanalStore.isEditingQuery(configId, name)
    profiles: config.get 'items'
    validation: exGanalStore.getQueryValidation(configId, name)

  render: ->
    #if query name changes it does not exist and so we have to check it
    if not @state.query
      div {}
    else
      if @state.isEditing
        QueryEditor
          configId: @state.configId
          onChange: @_onQueryChange
          query: @state.editingQuery
          profiles: @state.profiles
          validation: @state.validation
      else
        div {className: 'container-fluid'},
        div {className: 'kbc-main-content'},
          form className: 'form-horizontal',
            div className: 'row',
              @_createStaticInput('Name', 'name')
              @_createStaticInput('Metrics', 'metrics', true)
              @_createStaticInput('Dimensions', 'dimensions', true)
              @_createStaticInput('Filters', 'filters')
              @_createStaticInput('Segment', 'segment')
              @_createStaticInput('Profile', 'profile')

  _createStaticInput: (caption, propName, isArray = false) ->
    pvalue = @state.query.get(propName)
    if isArray
      pvalue = pvalue.toJS().join(',')
    if propName == 'filters'
      pvalue = if pvalue then pvalue.get(0) else 'n/a'
    if propName == 'name'
      pvalue = @state.name
    if propName == 'profile'
      pvalue = if pvalue then @_assmbleProfileName(pvalue) else '--all--'
    if propName == 'segment'
      pvalue = pvalue or 'n/a'

    div className: 'form-group',
      label className: 'control-label col-xs-4',
        caption,
      div className: 'col-xs-8',
        input
          className: 'form-control'
          type: 'text'
          disabled: true
          value: pvalue,

  _assmbleProfileName: (profileId) ->
    profile = @state.profiles.find( (p) ->
      p.get('googleId') == profileId
    )
    if profile
      accountName = profile.get('accountName')
      propertyName = profile.get('webPropertyName')
      pname = profile.get('name')
      return "#{accountName}/ #{propertyName}/ #{pname}"
    else
      return "Unknown Profile(#{profileId})"



  _onQueryChange: (newQuery) ->
    ExGanalActionCreators.changeQuery(@state.configId, @state.name, newQuery)
