
Dispatcher = require '../../../Dispatcher'
Immutable = require('immutable')
Map = Immutable.Map
List = Immutable.List
Constants = require '../Constants'
InstalledComponentsConstants = require '../../components/Constants'
InstalledComponentsStore = require '../../components/stores/InstalledComponentsStore'
StoreUtils = require '../../../utils/StoreUtils'
_ = require 'underscore'
parseBuckets = require('../utils/parseBuckets').default

_store = Map(
  transformationsByBucketId: Map()
  loadingTransformationBuckets: List()
  pendingActions: Map()
  overviews: Map()
  loadingOverviews: Map()
  showDisabledOverviews: Map()
  openInputMappings: Map()
  openOutputMappings: Map()
  editingTransformationsFields: Map()

)

addToLoadingBuckets = (store, bucketId) ->
  store.update 'loadingTransformationBuckets', (loadingTransformationBuckets) ->
    loadingTransformationBuckets.push bucketId

removeFromLoadingBuckets = (store, bucketId) ->
  store.update 'loadingTransformationBuckets', (loadingTransformationBuckets) ->
    loadingTransformationBuckets.remove(loadingTransformationBuckets.indexOf(bucketId))

enhanceTransformation = (transformation) ->
  if (transformation.get('backend') == 'docker')
    return transformation.set('queriesString', transformation.get('queries').join("\n"))
  else
    return transformation.set('queriesString', transformation.get('queries').join("\n\n"))

TransformationsStore = StoreUtils.createStore

  ###
    Return all transformations
  ###
  getAllTransformations: ->
    _store.getIn(['transformationsByBucketId'], List())

  ###
    Returns all transformations for bucket id
  ###
  getTransformations: (bucketId) ->
    _store
      .getIn(['transformationsByBucketId', bucketId], List())
      .sortBy((transformation) ->
        phase = transformation.get('phase', 0)
        name = transformation.get('name', '')
        phase + name.toLowerCase()
      )
  ###
    Check if store contains transformations for specified bucket
  ###
  hasTransformations: (bucketId) ->
    _store.get('transformationsByBucketId').has bucketId

  ###
    Returns one transformation by its id
  ###
  getTransformation: (bucketId, transformationId) ->
    _store.getIn ['transformationsByBucketId', bucketId, transformationId]

  getTransformationEditingFields: (bucketId, transformationId) ->
    _store.getIn ['editingTransformationsFields', bucketId, transformationId], Map()

  isTransformationEditingName: (bucketId, transformationId) ->
    _store.getIn ['editingTransformationsName', bucketId, transformationId], false

  hasTransformation: (bucketId, transformationId) ->
    _store.hasIn ['transformationsByBucketId', bucketId, transformationId]

  ###
    Test if specified transformation buckets are currently being loaded
  ###
  isBucketLoading: (bucketId) ->
    _store.get('loadingTransformationBuckets').contains bucketId

  getAllPendingActions: ->
    _store.getIn ['pendingActions'], Map()

  getPendingActions: (bucketId) ->
    _store.getIn ['pendingActions', bucketId], Map()

  getTransformationPendingActions: (bucketId, transformationId) ->
    _store.getIn ['pendingActions', bucketId, transformationId], Map()

  getOverview: (bucketId, transformationId) ->
    _store.getIn ['overviews', bucketId, transformationId]

  isOverviewLoading: (bucketId, transformationId) ->
    !!_store.getIn ['loadingOverviews', bucketId, transformationId]

  isShowDisabledInOverview: (bucketId, transformationId) ->
    if _store.getIn(['showDisabledOverviews', bucketId, transformationId]) == true
      return true
    if _store.getIn(['showDisabledOverviews', bucketId, transformationId]) == false
      return false
    _store.getIn(['transformationsByBucketId', bucketId, transformationId, "disabled"], false)

  isInputMappingOpen: (bucketId, transformationId, index) ->
    _store.getIn(['openInputMappings', bucketId, transformationId, index], false)

  isInputMappingClosed: (bucketId, transformationId, index) ->
    _store.getIn(['openOutputMappings', bucketId, transformationId, index], false)

  getOpenInputMappings: (bucketId, transformationId) ->
    _store.getIn(['openInputMappings', bucketId, transformationId], Map())

  getOpenOutputMappings: (bucketId, transformationId) ->
    _store.getIn(['openOutputMappings', bucketId, transformationId], Map())

  getTransformationEditingIsValid: (bucketId, transformationId) ->
    transformation = @getTransformation(bucketId, transformationId)
    if (!transformation)
      return
    if transformation.get('backend') == "docker" && transformation.get('type') == "openrefine"
      scriptsString = _store.getIn([
          'editingTransformationsFields'
          bucketId
          transformationId
          'queriesString'
        ], '')
      try
        JSON.parse(scriptsString)
        return true
      return false
    return true

  getTransformationDescription: (bucketId, transformationId) ->
    description = InstalledComponentsStore.getConfigRow('transformation', bucketId, transformationId).get('description')
    if (description == '')
      description = @getTransformation(bucketId, transformationId).get('description')
    return description

  getTransformationName: (bucketId, transformationId) ->
    name = InstalledComponentsStore.getConfigRow('transformation', bucketId, transformationId).get('name')
    if (name == '')
      name = @getTransformation(bucketId, transformationId).get('name')
    return name

Dispatcher.register (payload) ->
  action = payload.action

  switch action.type

    when Constants.ActionTypes.TRANSFORMATION_CREATE_SUCCESS
      _store = _store.setIn ['transformationsByBucketId', action.bucketId, action.transformation.id],
        enhanceTransformation(Immutable.fromJS(action.transformation))
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_OVERVIEW_LOAD
      _store = _store.setIn ['loadingOverviews', action.bucketId, action.transformationId], true
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_OVEWVIEW_LOAD_ERROR
      _store = _store.setIn ['loadingOverviews', action.bucketId, action.transformationId], false
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_OVERVIEW_LOAD_SUCCESS
      _store = _store.withMutations((store) ->
        store = store.setIn(['overviews', action.bucketId, action.transformationId],
          Immutable.fromJS(action.model)
        )
        store = store.setIn ['loadingOverviews', action.bucketId, action.transformationId], false
      )
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_OVERVIEW_SHOW_DISABLED
      _store = _store.setIn ['showDisabledOverviews', action.bucketId, action.transformationId], action.showDisabled
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_DELETE
      _store = _store.setIn ['pendingActions', action.bucketId, action.transformationId, 'delete'], true
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_DELETE_SUCCESS
      _store = _store.withMutations (store) ->
        store = store
        .removeIn ['transformationsByBucketId', action.bucketId, action.transformationId]
        .removeIn ['pendingActions', action.bucketId, action.transformationId, 'delete']
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_DELETE_ERROR
      _store = _store.removeIn ['pendingActions', action.bucketId, action.transformationId, 'delete']
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_INPUT_MAPPING_OPEN_TOGGLE
      if (_store.getIn(['openInputMappings', action.bucketId, action.transformationId, action.index], false))
        _store = _store.setIn(['openInputMappings', action.bucketId, action.transformationId, action.index], false)
      else
        _store = _store.setIn(['openInputMappings', action.bucketId, action.transformationId, action.index], true)
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_OUTPUT_MAPPING_OPEN_TOGGLE
      if (_store.getIn(['openOutputMappings', action.bucketId, action.transformationId, action.index], false))
        _store = _store.setIn(['openOutputMappings', action.bucketId, action.transformationId, action.index], false)
      else
        _store = _store.setIn(['openOutputMappings', action.bucketId, action.transformationId, action.index], true)
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START
      _store = _store.setIn ['pendingActions', action.bucketId, action.transformationId, action.pendingAction], true
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS
      _store = _store.withMutations (store) ->
        tObj = enhanceTransformation(Immutable.fromJS(action.data))
        store = store
          .setIn ['transformationsByBucketId', action.bucketId, action.transformationId], tObj
          .deleteIn ['pendingActions', action.bucketId, action.transformationId, action.pendingAction]

        if action.editingId
          store = store.deleteIn [
            'editingTransformationsFields'
            action.bucketId
            action.transformationId
            action.editingId
          ]
          if (action.editingId == 'queries')
            store = store.deleteIn [
              'editingTransformationsFields'
              action.bucketId
              action.transformationId
              'queriesChanged'
            ]
          if (action.editingId == 'packages')
            store = store.deleteIn [
              'editingTransformationsFields'
              action.bucketId
              action.transformationId
              'packagesChanged'
            ]
          if (action.editingId == 'tags')
            store = store.deleteIn [
              'editingTransformationsFields'
              action.bucketId
              action.transformationId
              'tagsChanged'
            ]

      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR
      _store = _store.deleteIn ['pendingActions', action.bucketId, action.transformationId, action.pendingAction]
      TransformationsStore.emitChange()

    when InstalledComponentsConstants.ActionTypes.INSTALLED_COMPONENTS_CONFIGSDATA_LOAD_SUCCESS
      if (action.componentId != 'transformation')
        return
      bucketsData = parseBuckets(action.configData)
      _store = _store.withMutations((store) ->
        store = store.delete 'transformationsByBucketId'
        _.each(bucketsData, (bucket) ->
          _.each(bucket.transformations, (transformation) ->
            tObj = enhanceTransformation(Immutable.fromJS(transformation))
            store = store.setIn ['transformationsByBucketId', bucket.id, tObj.get 'id'], tObj
          )
        )
      )
      TransformationsStore.emitChange()


    when Constants.ActionTypes.TRANSFORMATION_START_EDIT_FIELD
      _store = _store.setIn [
        'editingTransformationsFields'
        action.bucketId
        action.transformationId
        action.fieldId
      ], _store.getIn([
        'transformationsByBucketId'
        action.bucketId
        action.transformationId
        action.fieldId
      ], Immutable.Map())
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_UPDATE_EDITING_FIELD
      _store = _store.setIn [
        'editingTransformationsFields'
        action.bucketId
        action.transformationId
        action.fieldId
      ], action.newValue
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_CANCEL_EDITING_FIELD
      _store = _store.deleteIn [
        'editingTransformationsFields'
        action.bucketId
        action.transformationId
        action.fieldId
      ]
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_UPDATE_PARSE_QUERIES
      _store = _store.setIn ['pendingActions', action.bucketId, action.transformationId, 'queries-processing'], true
      _store = _store.setIn [
        'editingTransformationsFields'
        action.bucketId
        action.transformationId
        'splitQueries'
      ], Immutable.fromJS([action.queriesString])
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_UPDATE_PARSE_QUERIES_SUCCESS
      _store = _store.deleteIn ['pendingActions', action.bucketId, action.transformationId, 'queries-processing']
      _store = _store.setIn [
        'editingTransformationsFields'
        action.bucketId
        action.transformationId
        'splitQueries'
      ], Immutable.fromJS(action.splitQueries)
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_UPDATE_PARSE_QUERIES_ERROR
      _store = _store.deleteIn ['pendingActions', action.bucketId, action.transformationId, 'queries-processing']
      TransformationsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_BUCKET_DELETE_SUCCESS
      _store = _store.withMutations (store) ->
        store
        .removeIn ['transformationsByBucketId', action.bucketId]
      TransformationsStore.emitChange()


module.exports = TransformationsStore
