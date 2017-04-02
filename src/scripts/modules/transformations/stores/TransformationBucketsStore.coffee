
Dispatcher = require '../../../Dispatcher'
Immutable = require('immutable')
Map = Immutable.Map
List = Immutable.List
Constants = require '../Constants'
InstalledComponentsConstants = require '../../components/Constants'
fuzzy = require 'fuzzy'
StoreUtils = require '../../../utils/StoreUtils'

_store = Map(
  bucketsById: Map()
  isLoading: false
  isLoaded: false
  loadingBuckets: List()
  pendingActions: Map() # by bucket id id
  filters: Map()
  toggles: Map()

)

TransformationBucketsStore = StoreUtils.createStore

  ###
    Returns all transformations sorted by name
  ###
  getAll: ->
    _store
      .get('bucketsById')
      .sortBy((bucket) -> bucket.get('name'))

  ###
    Returns orchestration specified by id
  ###
  get: (id) ->
    _store.getIn ['bucketsById', id]

  has: (id) ->
    _store.get('bucketsById').has id

  getIsLoading: ->
    _store.get 'isLoading'

  getIsLoaded: ->
    _store.get 'isLoaded'

  getPendingActions: ->
    _store.get 'pendingActions'

  getPendingActionsForBucket: (bucketId) ->
    @getPendingActions().get(bucketId, Map())

  getTransformationBucketsFilter: ->
    _store.getIn ['filters', 'buckets'], ''

  getToggles: ->
    _store.getIn ['toggles'], Map()

Dispatcher.register (payload) ->
  action = payload.action

  switch action.type
    when Constants.ActionTypes.TRANSFORMATION_BUCKETS_LOAD
      _store = _store.set 'isLoading', true
      TransformationBucketsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_BUCKETS_LOAD_SUCCESS
      _store = _store.withMutations((store) ->
        store
          .set('isLoading', false)
          .set('isLoaded', true)
          .set('bucketsById', Immutable.fromJS(action.buckets).toMap().mapKeys((key, bucket) ->
            bucket.get 'id'
          ))
      )
      TransformationBucketsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_BUCKET_CREATE_SUCCESS
      _store = _store.setIn ['bucketsById', action.bucket.id], Immutable.fromJS(action.bucket)
      TransformationBucketsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_BUCKET_DELETE
      _store = _store.setIn ['pendingActions', action.bucketId, 'delete'], true
      TransformationBucketsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_BUCKET_DELETE_ERROR
      _store = _store.deleteIn ['pendingActions', action.bucketId, 'delete']
      TransformationBucketsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_BUCKET_DELETE_SUCCESS
      _store = _store.withMutations (store) ->
        store
        .removeIn ['bucketsById', action.bucketId]
        .removeIn ['pendingActions', action.bucketId, 'delete']
      TransformationBucketsStore.emitChange()

    when Constants.ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE
      _store = _store.setIn ['pendingActions', action.bucketId, 'restore'], true
      TransformationBucketsStore.emitChange()

    when Constants.ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE_ERROR
      _store = _store.deleteIn ['pendingActions', action.bucketId, 'restore']
      TransformationBucketsStore.emitChange()

    when Constants.ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE_SUCCESS
      _store = _store.withMutations (store) ->
        store
        .removeIn ['pendingActions', action.bucketId, 'restore']
      TransformationBucketsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_BUCKETS_FILTER_CHANGE
      _store = _store.setIn ['filters', 'buckets'], action.filter
      TransformationBucketsStore.emitChange()

    when Constants.ActionTypes.TRANSFORMATION_BUCKETS_TOGGLE
      current = _store.getIn [
        'toggles'
        action.bucketId
      ], false

      _store = _store.setIn [
        'toggles'
        action.bucketId
      ], !current

      TransformationBucketsStore.emitChange()

    when InstalledComponentsConstants.ActionTypes.INSTALLED_COMPONENTS_UPDATE_CONFIGURATION_SUCCESS
      # propagate bucket name change from installed components
      if (action.componentId == 'transformation' && action.field == 'name')
        _store = _store.setIn ['bucketsById', action.configurationId, action.field], action.data[action.field]

module.exports = TransformationBucketsStore
