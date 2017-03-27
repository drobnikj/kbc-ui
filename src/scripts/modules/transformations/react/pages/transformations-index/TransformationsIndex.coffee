React = require('react')
Immutable = require('immutable')
fuzzy = require 'fuzzy'


TransformationBucketRow = React.createFactory(require './TransformationBucketRow')
TransformationsList = require './TransformationsList'
TransformationActionCreators = require '../../../ActionCreators'
createStoreMixin = require '../../../../../react/mixins/createStoreMixin'
TransformationBucketsStore = require('../../../stores/TransformationBucketsStore')
TransformationsStore = require('../../../stores/TransformationsStore')
InstalledComponentsStore = require('../../../../components/stores/InstalledComponentsStore')
SearchRow = require('../../../../../react/common/SearchRow').default
ApplicationStore = require('../../../../../stores/ApplicationStore')

{Panel, PanelGroup} = require('react-bootstrap')

NewTransformationBucketButton = require '../../components/NewTransformationBucketButton'

{div, span, input, strong, form, button, h4, h2, i, button, small, ul, li, a, p} = React.DOM
TransformationsIndex = React.createClass
  displayName: 'TransformationsIndex'
  mixins: [createStoreMixin(TransformationBucketsStore, TransformationsStore, InstalledComponentsStore)]

  getStateFromStores: ->
    buckets: TransformationBucketsStore.getAll()
    toggles: TransformationBucketsStore.getToggles()
    pendingActions: TransformationBucketsStore.getPendingActions()
    filter: TransformationBucketsStore.getTransformationBucketsFilter()
    transformationsInBuckets: TransformationsStore.getAllTransformations()
    transformationPendingActions: TransformationsStore.getAllPendingActions()
    legacyUI: ApplicationStore.hasCurrentProjectFeature('legacy-transformations-ui')

  _handleFilterChange: (query) ->
    TransformationActionCreators.setTransformationBucketsFilter(query)

  render: ->
    div className: 'container-fluid',
      div className: 'kbc-main-content',
        if @state.buckets.count()
          React.createElement SearchRow,
            className: 'row kbc-search-row'
            onChange: @_handleFilterChange
            query: @state.filter
        else
          null
        span {},
          if @_getFilteredBuckets().count()
            div className: 'kbc-accordion kbc-panel-heading-with-table kbc-panel-heading-with-table'
            ,
              @_getFilteredBuckets().map (bucket) ->
                @_renderBucketPanel bucket
              , @
              .toArray()
          else
            @_renderEmptyState()

  _renderEmptyState: ->
    div {className: 'kbc-search-row'},
      if @state.filter && @state.filter != ''
        h2 null,
          'No buckets or transformations found.'
      else
        span {},
          h2 null,
            'Transformations allow you to modify your data.'
          p null,
            'A Transformation picks data from Storage, manipulates it and then stores it back.
              A transformation can be written in SQL (Snowflake, Redshift or MySQL), R, Python or OpenRefine.'
          p null,
            React.createElement NewTransformationBucketButton

  _renderBucketPanel: (bucket) ->
    header = span null,
      span className: 'table',
        TransformationBucketRow
          bucket: bucket
          transformations: TransformationsStore.getTransformations(bucket.get('id'))
          description: TransformationBucketsStore.get(bucket.get('id')).get 'description'
          pendingActions: @state.pendingActions.get(bucket.get('id'), Immutable.Map())
          key: bucket.get 'id'
          legacyUI: @state.legacyUI

    React.createElement Panel,
      header: header
      key: bucket.get("id")
      eventKey: bucket.get("id")
      expanded: !!@state.filter.length || @state.toggles.getIn([bucket.get("id")])
      collapsible: true
      onSelect: @_handleBucketSelect.bind(@, bucket.get("id"))
    ,
      React.createElement TransformationsList,
        bucket: bucket
        transformations: @_getFilteredTransformations(bucket.get('id'))
        pendingActions: @state.transformationPendingActions.getIn([bucket.get('id')], Immutable.Map())
        legacyUI: @state.legacyUI

  _handleBucketSelect: (bucketId, e) ->
    e.preventDefault()
    e.stopPropagation()
    TransformationActionCreators.toggleBucket bucketId

  _getFilteredBuckets: ->
    filtered = @state.buckets
    if @state.filter && @state.filter != ''
      filter = @state.filter
      component = @
      filtered = @state.buckets.filter (bucket) ->
        fuzzy.match(filter, bucket.get('name').toString()) or
          fuzzy.match(filter, bucket.get('id').toString()) or
          fuzzy.match(filter, bucket.get('description').toString()) or
          component._getFilteredTransformations(bucket.get('id')).count()

    filtered = filtered.sortBy((bucket) ->
      bucket.get('name').toLowerCase()
    )
    return filtered

  _getFilteredTransformations: (bucketId) ->
    filtered = @state.transformationsInBuckets.getIn([bucketId], Immutable.Map())
    if @state.filter && @state.filter != ''
      filter = @state.filter
      filtered = @state.transformationsInBuckets.getIn([bucketId], Immutable.Map()).filter((transformation) ->
        fuzzy.match(filter, transformation.get('name').toString()) or
          fuzzy.match(filter, transformation.get('description').toString()) or
          fuzzy.match(filter, transformation.get('fullId', '').toString()) or
          fuzzy.match(filter, transformation.get('id', '').toString())
      )

    filtered = filtered.sortBy((transformation) ->
      # phase with padding
      phase = ("0000" + transformation.get('phase')).slice(-4)
      name = transformation.get('name', '')
      phase + name.toLowerCase()
    )
    return filtered


module.exports = TransformationsIndex
