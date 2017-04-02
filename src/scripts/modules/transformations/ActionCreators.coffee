dispatcher = require '../../Dispatcher'
constants = require './Constants'
React = require 'react'
{Link} = require 'react-router'

ConfigurationCopiedNotification = require('../components/react/components/ConfigurationCopiedNotification').default

transformationsApi = require './TransformationsApiAdapter'
TransformationBucketsStore = require './stores/TransformationBucketsStore'
TransformationsStore = require './stores/TransformationsStore'
InstalledComponentsActionCreators = require '../components/InstalledComponentsActionCreators'
InstalledComponentsStore = require '../components/stores/InstalledComponentsStore'
RoutesStore = require '../../stores/RoutesStore'
Promise = require 'bluebird'
_ = require 'underscore'
parseQueries = require('./utils/parseQueries').default
VersionActionCreators = require('../components/VersionsActionCreators')
ApplicationActionCreators = require '../../actions/ApplicationActionCreators'
{capitalize} = require('../../utils/string').default
module.exports =

  ###
    Request orchestrations reload from server
  ###
  loadTransformationBucketsForce: ->
    actions = @

    # trigger load initialized
    dispatcher.handleViewAction(
      type: constants.ActionTypes.TRANSFORMATION_BUCKETS_LOAD
    )

    # init load
    transformationsApi
    .getTransformationBuckets()
    .then((buckets) ->
      # load success
      actions.receiveTransformationBuckets(buckets)
    )
    .catch (err) ->
      throw err

  receiveTransformationBuckets: (buckets) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.TRANSFORMATION_BUCKETS_LOAD_SUCCESS
      buckets: buckets
    )

  ###
    Request transformation buckets load only if not already loaded
    @return Promise
  ###
  loadTransformationBuckets: ->
    # don't load if already loaded
    if TransformationBucketsStore.getIsLoaded()
      @.loadTransformationBucketsForce()
      return Promise.resolve()
    else
      return @.loadTransformationBucketsForce()

  createTransformationBucket: (data) ->
    newBucket = {}
    changeDescription = "Create transformation bucket " + data.name
    transformationsApi
    .createTransformationBucket(data, changeDescription)
    .then((bucket) ->
      newBucket = bucket
      InstalledComponentsActionCreators.loadComponentsForce()
    )
    .then( ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.TRANSFORMATION_BUCKET_CREATE_SUCCESS
        bucket: newBucket
      )
      VersionActionCreators.loadVersionsForce('transformation', newBucket.id)
      RoutesStore.getRouter().transitionTo 'transformationBucket',
        config: newBucket.id
    )

  createTransformation: (bucketId, data) ->
    changeDescription = "Create transformation " + data.get("name")
    transformationsApi
    .createTransformation bucketId, data.toJS(), changeDescription
    .then (transformation) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.TRANSFORMATION_CREATE_SUCCESS
        bucketId: bucketId
        transformation: transformation
      )
      VersionActionCreators.loadVersionsForce('transformation', bucketId)
      RoutesStore.getRouter().transitionTo 'transformationDetail',
        row: transformation.id
        config: bucketId


  deleteTransformationBucket: (bucketId) ->
    actions = @
    bucket = TransformationBucketsStore.get bucketId

    dispatcher.handleViewAction
      type: constants.ActionTypes.TRANSFORMATION_BUCKET_DELETE
      bucketId: bucketId

    transformationsApi
    .deleteTransformationBucket(bucketId)
    .then ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.TRANSFORMATION_BUCKET_DELETE_SUCCESS
        bucketId: bucketId

      ApplicationActionCreators.sendNotification
        message: React.createClass
          revertConfigRemove: ->
            actions.restoreTransformationBucket(bucket)
            @props.onClick()
          render: ->
            React.DOM.span null,
              "Bucket #{bucket.get('name')} was moved to "
              React.createElement Link,
                to: 'settings-trash'
                onClick: @props.onClick
              ,
                'Trash'
              '. '
              React.DOM.a
                onClick: @revertConfigRemove
              ,
                'Revert'
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.TRANSFORMATION_BUCKET_DELETE_ERROR
        bucketId: bucketId
      throw e

  restoreTransformationBucket: (bucket) ->
    actions = @
    bucketId = bucket.get 'id'

    dispatcher.handleViewAction
      type: constants.ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE
      bucketId: bucketId

    transformationsApi
    .restoreTransformationBucket(bucketId)
    .then ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE_SUCCESS
        bucketId: bucketId

      actions.loadTransformationBucketsForce()
      .then (response) ->
        ApplicationActionCreators.sendNotification
          message: React.createClass
            render: ->
              React.createElement ConfigurationCopiedNotification,
                message: "Bucket #{bucket.get('name')} was "
                linkLabel: 'restored'
                componentId: 'transformation'
                configId: bucketId
                onClick: @props.onClick
    .catch (e) ->
      dispatcher.handleViewAction
        type: constants.ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE_ERROR
        bucketId: bucketId
      throw e

  deleteTransformation: (bucketId, transformationId) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.TRANSFORMATION_DELETE
      bucketId: bucketId
      transformationId: transformationId
    )

    transformation = TransformationsStore.getTransformation(bucketId, transformationId)
    changeDescription = "Delete transformation " + transformation.get("name")

    transformationsApi
    .deleteTransformation(bucketId, transformationId, changeDescription)
    .then( ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.TRANSFORMATION_DELETE_SUCCESS
        transformationId: transformationId
        bucketId: bucketId
      )
      VersionActionCreators.loadVersionsForce('transformation', bucketId)
      return
    )
    .catch((error) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.TRANSFORMATION_DELETE_ERROR
        transformationId: transformationId
        bucketId: bucketId
      )
      throw error
    )

  ###
    Request overview load from server
  ###
  loadTransformationOverview: (bucketId, transformationId, showDisabled) ->
    actions = @
    _.defer( ->
      # trigger load initialized
      dispatcher.handleViewAction(
        type: constants.ActionTypes.TRANSFORMATION_OVERVIEW_LOAD
        transformationId: transformationId
        bucketId: bucketId
      )

      tableId = bucketId + "." + transformationId
      # init load
      transformationsApi
      .getGraph
        tableId: tableId
        direction: 'around'
        showDisabled: showDisabled
        limit: {sys: [bucketId]}
      .then((graphData) ->
        # load success
        dispatcher.handleViewAction(
          type: constants.ActionTypes.TRANSFORMATION_OVERVIEW_LOAD_SUCCESS
          transformationId: transformationId
          bucketId: bucketId
          model: graphData
        )

      )
      .catch((error) ->
        dispatcher.handleViewAction(
          type: constants.ActionTypes.TRANSFORMATION_OVERVIEW_LOAD_ERROR
          transformationId: transformationId
          bucketId: bucketId
        )
        throw error
      )
    )

  showTransformationOverviewDisabled: (bucketId, transformationId, showDisabled) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.TRANSFORMATION_OVERVIEW_SHOW_DISABLED
      transformationId: transformationId
      bucketId: bucketId
      showDisabled: showDisabled
    )
    @loadTransformationOverview(bucketId, transformationId, showDisabled)

  toggleOpenInputMapping: (bucketId, transformationId, index) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.TRANSFORMATION_INPUT_MAPPING_OPEN_TOGGLE
      transformationId: transformationId
      bucketId: bucketId
      index: index
    )

  toggleOpenOutputMapping: (bucketId, transformationId, index) ->
    dispatcher.handleViewAction(
      type: constants.ActionTypes.TRANSFORMATION_OUTPUT_MAPPING_OPEN_TOGGLE
      transformationId: transformationId
      bucketId: bucketId
      index: index
    )

  changeTransformationProperty: (bucketId, transformationId, propertyName, newValue, changeDescription) ->
    pendingAction = "save-#{propertyName}"

    dispatcher.handleViewAction(
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START
      transformationId: transformationId
      bucketId: bucketId
      pendingAction: pendingAction
    )

    transformation = TransformationsStore.getTransformation(bucketId, transformationId)
    transformation = transformation.set(propertyName, newValue)

    if (!changeDescription)
      changeDescription = 'Change ' + capitalize(propertyName) + ' in ' + transformation.get('name')

    transformationsApi
    .saveTransformation(bucketId, transformationId, transformation.toJS(), changeDescription)
    .then (response) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS
        transformationId: transformationId
        bucketId: bucketId
        editingId: propertyName
        pendingAction: pendingAction
        data: response
      )
      VersionActionCreators.loadVersionsForce('transformation', bucketId)
    .catch (error) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR
        transformationId: transformationId
        bucketId: bucketId
        editingId: propertyName
        pendingAction: pendingAction
        error: error
      )
      throw error

  setTransformationBucketsFilter: (query) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.TRANSFORMATION_BUCKETS_FILTER_CHANGE
      filter: query

  toggleBucket: (bucketId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.TRANSFORMATION_BUCKETS_TOGGLE
      bucketId: bucketId

  startTransformationFieldEdit: (bucketId, transformationId, fieldId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.TRANSFORMATION_START_EDIT_FIELD
      bucketId: bucketId
      transformationId: transformationId
      fieldId: fieldId

  updateTransformationEditingField: (bucketId, transformationId, fieldId, newValue) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.TRANSFORMATION_UPDATE_EDITING_FIELD
      bucketId: bucketId
      transformationId: transformationId
      fieldId: fieldId
      newValue: newValue

  cancelTransformationEditingField: (bucketId, transformationId, fieldId) ->
    dispatcher.handleViewAction
      type: constants.ActionTypes.TRANSFORMATION_CANCEL_EDITING_FIELD
      bucketId: bucketId
      transformationId: transformationId
      fieldId: fieldId

  saveTransformationEditingField: (bucketId, transformationId, fieldId, changeDescription) ->
    value = TransformationsStore.getTransformationEditingFields(bucketId, transformationId).get(fieldId)

    pendingAction = "save-#{fieldId}"
    dispatcher.handleViewAction(
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START
      transformationId: transformationId
      bucketId: bucketId
      pendingAction: pendingAction
    )

    transformation = TransformationsStore.getTransformation(bucketId, transformationId)
    if fieldId == 'queriesString'
      transformation = transformation.set 'queries', parseQueries(transformation, value)
    else
      transformation = transformation.set fieldId, value

    if (!changeDescription)
      changeDescription = 'Change ' + capitalize(fieldId) + ' in ' + transformation.get('name')

    transformationsApi
    .saveTransformation(bucketId, transformationId, transformation.toJS(), changeDescription)
    .then (response) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS
        transformationId: transformationId
        bucketId: bucketId
        editingId: fieldId
        pendingAction: pendingAction
        data: response
      )
      VersionActionCreators.loadVersionsForce('transformation', bucketId)
    .catch (error) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR
        transformationId: transformationId
        bucketId: bucketId
        editingId: fieldId
        pendingAction: pendingAction
        error: error
      )
      throw error

  ###
    Create new or update existing output mapping
  ###
  saveTransformationMapping: (bucketId, transformationId, mappingType, editingId, mappingIndex = null) ->
    mapping = TransformationsStore.getTransformationEditingFields(bucketId, transformationId).get(editingId)
    transformation = TransformationsStore.getTransformation(bucketId, transformationId)

    if mappingIndex == null
      changeDescription = 'Create ' + mappingType + ' mapping in ' + transformation.get('name')
    else
      changeDescription = 'Update ' + mappingType + ' mapping in ' + transformation.get('name')

    transformation = transformation.update mappingType, (mappings) ->
      if mappingIndex != null
        mappings.set mappingIndex, mapping
      else
        mappings.push mapping
    return Promise.resolve() if not mapping

    transformationsApi
    .saveTransformation(bucketId, transformationId, transformation.toJS(), changeDescription)
    .then (response) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS
        transformationId: transformationId
        bucketId: bucketId
        editingId: editingId
        data: response
      )
      VersionActionCreators.loadVersionsForce('transformation', bucketId)
    .catch (error) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR
        transformationId: transformationId
        bucketId: bucketId
        error: error
      )
      throw error

  deleteTransformationMapping: (bucketId, transformationId, mappingType, mappingIndex) ->
    transformation = TransformationsStore.getTransformation(bucketId, transformationId)

    transformation = transformation.update mappingType, (mappings) ->
      mappings.delete(mappingIndex)

    changeDescription = 'Delete ' + mappingType + ' mapping in ' + transformation.get('name')

    pendingAction = "delete-#{mappingType}-#{mappingIndex}"
    dispatcher.handleViewAction(
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START
      transformationId: transformationId
      bucketId: bucketId
      pendingAction: pendingAction
    )

    transformationsApi
    .saveTransformation(bucketId, transformationId, transformation.toJS(), changeDescription)
    .then (response) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS
        transformationId: transformationId
        bucketId: bucketId
        data: response
        pendingAction: pendingAction
      )
      VersionActionCreators.loadVersionsForce('transformation', bucketId)
    .catch (error) ->
      dispatcher.handleViewAction(
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR
        transformationId: transformationId
        bucketId: bucketId
        pendingAction: pendingAction
        error: error
      )
      throw error
