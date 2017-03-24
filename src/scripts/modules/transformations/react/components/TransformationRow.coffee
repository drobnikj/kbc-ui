React = require 'react'
Link = React.createFactory(require('react-router').Link)
Immutable = require('immutable')
ImmutableRenderMixin = require '../../../../react/mixins/ImmutableRendererMixin'
InstalledComponentsActionCreators = require '../../../components/InstalledComponentsActionCreators'
RunComponentButton = React.createFactory(require '../../../components/react/components/RunComponentButton')
TransformationTypeLabel = React.createFactory(require './TransformationTypeLabel')
DeleteButton = React.createFactory(require '../../../../react/common/DeleteButton')
ActivateDeactivateButton = React.createFactory(require('../../../../react/common/ActivateDeactivateButton').default)
CreateSandboxButton = require('./CreateSandboxButton').default
TransformationsActionCreators = require '../../ActionCreators'
descriptionExcerpt = require('../../../../utils/descriptionExcerpt').default

{span, div, a, button, i, h4, small, em} = React.DOM

TransformationRow = React.createClass(
  displayName: 'TransformationRow'
  mixins: [ImmutableRenderMixin]
  propTypes:
    transformation: React.PropTypes.object
    bucket: React.PropTypes.object
    pendingActions: React.PropTypes.object
    hideButtons: React.PropTypes.bool
    legacyUI: React.PropTypes.bool

  buttons: ->
    buttons = []
    props = @props

    buttons.push(DeleteButton
      key: 'delete'
      tooltip: 'Delete Transformation'
      isPending: @props.pendingActions.get 'delete'
      confirm:
        title: 'Delete Transformation'
        text: "Do you really want to delete transformation #{@props.transformation.get('name')}?"
        onConfirm: @_deleteTransformation
    )

    buttons.push(React.createElement CreateSandboxButton,
      backend: @props.transformation.get("backend")
      mode: "button"
      runParams: Immutable.Map
        configBucketId: @props.bucket.get('id')
        transformations: [@props.transformation.get('id')]
  )

    buttons.push(RunComponentButton(
      key: 'run'
      title: "Run #{@props.transformation.get('name')}"
      component: 'transformation'
      mode: 'button'
      runParams: ->
        configBucketId: props.bucket.get('id')
        transformations: [props.transformation.get('id')]
    ,
      "You are about to run the transformation #{@props.transformation.get('name')}."
    ))

    buttons.push ActivateDeactivateButton
      key: 'active'
      activateTooltip: 'Enable Transformation'
      deactivateTooltip: 'Disable Transformation'
      isActive: !@props.transformation.get('disabled')
      isPending: @props.pendingActions.has 'save-disabled'
      onChange: @_handleActiveChange

    buttons

  render: ->
    items = []

    # transformation name
    if (@props.legacyUI)
      items.push(
        span {className: 'td col-xs-3'},
          h4 {},
            span {className: 'label kbc-label-rounded-small label-default pull-left'},
              @props.transformation.get('phase') || 1
            ' '
            @props.transformation.get('name')
      )
    else
      items.push(
        span {className: 'td col-xs-3'},
          h4 {},
            @props.transformation.get('name')
      )

    # backend label
    if (@props.legacyUI)
      items.push(
        span {className: 'td col-xs-1'},
          TransformationTypeLabel
            backend: @props.transformation.get 'backend'
            type: @props.transformation.get 'type'
      )

    # description
    if (@props.hideButtons)
      items.push(
        span {className: 'td col-xs-8'},
          small {}, descriptionExcerpt(@props.transformation.get('description')) || em {}, 'No description'
      )
    else
      items.push(
        span {className: 'td col-xs-4'},
          small {}, descriptionExcerpt(@props.transformation.get('description')) || em {}, 'No description'
      )

    # buttons
    if (!@props.hideButtons)
      items.push(
        span {className: 'td text-right col-xs-4'},
          @buttons()
      )


    Link
      className: 'tr'
      to: 'transformationDetail'
      params: {row: @props.transformation.get('id'), config: @props.bucket.get('id')}
    ,
      items

  _deleteTransformation: ->
    # if transformation is deleted immediately view is rendered with missing bucket because of store changed
    transformationId = @props.transformation.get('id')
    bucketId = @props.bucket.get('id')
    setTimeout ->
      TransformationsActionCreators.deleteTransformation(bucketId, transformationId)

  _handleActiveChange: (newValue) ->
    transformationId = @props.transformation.get('id')
    bucketId = @props.bucket.get('id')
    if (newValue)
      changeDescription = 'Transformation ' + @props.transformation.get('name') + ' enabled'
    else
      changeDescription = 'Transformation ' + @props.transformation.get('name') + ' disabled'
    TransformationsActionCreators.changeTransformationProperty(
      bucketId,
      transformationId,
      'disabled',
      !newValue,
      changeDescription
    )
)

module.exports = TransformationRow
