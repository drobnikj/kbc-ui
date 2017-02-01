React = require 'react'
ImmutableRenderMixin = require '../../../../../react/mixins/ImmutableRendererMixin'
InstalledComponentsActionCreators = require '../../../../components/InstalledComponentsActionCreators'
RunComponentButton = React.createFactory(require '../../../../components/react/components/RunComponentButton')
DeleteButton = React.createFactory(require '../../../../../react/common/DeleteButton')
TransformationActionCreators = require '../../../ActionCreators'
RoutesStore = require '../../../../../stores/RoutesStore'
NewTransformationModal = require('../../modals/NewTransformation').default
{ModalTrigger, OverlayTrigger, Tooltip} = require 'react-bootstrap'
descriptionExcerpt = require('../../../../../utils/descriptionExcerpt').default

{span, div, a, button, i, h4, small, em} = React.DOM

TransformationBucketRow = React.createClass(
  displayName: 'TransformationBucketRow'
  mixins: [ImmutableRenderMixin]
  propTypes:
    bucket: React.PropTypes.object
    transformations: React.PropTypes.object
    pendingActions: React.PropTypes.object
    description: React.PropTypes.string

  buttons: ->
    buttons = []
    props = @props

    buttons.push(RunComponentButton(
      title: "Run #{@props.bucket.get('name')}"
      component: 'transformation'
      mode: 'button'
      runParams: ->
        configBucketId: props.bucket.get('id')
      key: 'run'
      tooltip: 'Run all transformations in bucket'
    ,
      "You are about to run all transformations in bucket #{@props.bucket.get('name')}."
    ))

    buttons.push(DeleteButton(
      tooltip: "Delete Immediatelly"
      icon: "fa-times"
      isPending: false
      confirm:
        title: 'Delete Immediatelly'
        text: "Do you really want to Delete bucket #{@props.bucket.get('name')}?"
        onConfirm: @._deleteTransformationBucket
    ))

    buttons

  render: ->
    span {className: 'tr'},
      span {className: 'td col-xs-4'},
        h4 {}, @props.bucket.get('name')
      span {className: 'td col-xs-5'},
        small {}, descriptionExcerpt(@props.description) || em {}, 'No description'
      span {className: 'td col-xs-3 text-right kbc-no-wrap'},
        @buttons()

  _deleteTransformationBucket: ->
    # if transformation is deleted immediately view is rendered with missing bucket because of store changed
    bucketId = @props.bucket.get('id')
    TransformationActionCreators.deleteTransformationBucket(bucketId)
)

module.exports = TransformationBucketRow
