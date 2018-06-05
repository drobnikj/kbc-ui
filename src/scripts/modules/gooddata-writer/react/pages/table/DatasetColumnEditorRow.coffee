React = require 'react'
Immutable = require 'immutable'
keyMirror = require('fbjs/lib/keyMirror')

{Map} = Immutable

{tr, td, option, span, div, strong} = React.DOM
StaticText = React.createFactory(require('./../../../../../react/common/KbcBootstrap').FormControls.Static)
Input = React.createFactory(require('./../../../../../react/common/KbcBootstrap').Input)
{FormControl, InputGroup, FormGroup} = require('react-bootstrap')
FormControl = React.createFactory FormControl
InputGroupAddon = React.createFactory InputGroup.Addon
InputGroup = React.createFactory InputGroup
FormGroup = React.createFactory FormGroup

DateDimensionModal = React.createFactory(require './DateDimensionSelectModal')
ColumnDataPreview = React.createFactory(require './ColumnDataPreview')
DateFormatHint = React.createFactory(require './DateFormatHint')
PureRenderMixin = require 'react-immutable-render-mixin'


{ColumnTypes, DataTypes, SortOrderOptions} = require '../../../constants'


visibleParts = keyMirror(
  DATA_TYPE: null
  SORT_LABEL: null
  DATE: null
  REFERENCE: null
  SCHEMA_REFERENCE: null
  IDENTIFIER_LABEL: null
  IDENTIFIER_TIME: null
)


module.exports = React.createClass
  displayName: 'DatasetColumnEditorRow'
  mixins: [PureRenderMixin]
  propTypes:
    column: React.PropTypes.object.isRequired
    referenceableColumns: React.PropTypes.object.isRequired
    referenceableTables: React.PropTypes.object.isRequired
    sortLabelColumns: React.PropTypes.object.isRequired
    configurationId: React.PropTypes.string.isRequired
    isEditing: React.PropTypes.bool.isRequired
    isValid: React.PropTypes.bool.isRequired
    isSaving: React.PropTypes.bool.isRequired
    onChange: React.PropTypes.func.isRequired
    dataPreview: React.PropTypes.array
    showIdentifier: React.PropTypes.bool.isRequired
    isExported: React.PropTypes.bool.isRequired

  render: ->
    column = @props.column
    rowClassName = if @props.isValid then '' else 'danger'
    tr className: rowClassName,
      td className: 'kbc-static-cell',
        column.get('name'),
      td null,
        if not @_isIgnoreType() and @props.column.get('type') not in [ColumnTypes.DATE, ColumnTypes.REFERENCE]
          @_createInput
            type: 'text'
            value: column.get 'title'
            disabled: @props.isSaving
            onChange: @_handleInputChange.bind @, 'title'
      td null,
        @_createInput
          type: 'select'
          value: column.get 'type'
          disabled: @props.isSaving
          onChange: @_handleInputChange.bind @, 'type'
        ,
          @_selectOptions Immutable.fromJS(ColumnTypes)

      td null,
        @_renderSchemaReferenceSelect()
        @_renderReferenceSelect()
        @_renderDateSelect()

      td null,
        if not @_isIgnoreType()
          @_renderSortLabelSelect()
      td null,
        if not @_isIgnoreType()
          @_renderSortOrderSelect()
      td null,
        if not @_isIgnoreType()
          @_renderDataTypeSelect()
      if @props.showIdentifier
        td null,
          if not @_isIgnoreType()
            @_createInput
              type: 'text'
              value: column.get 'identifier'
              disabled: @props.isExported || @props.isSaving
              onChange: @_handleInputChange.bind @, 'identifier'
      if @props.showIdentifier
        td null,
          if not @_isIgnoreType()
            span null,
              @_renderIdentifierLabel()
              @_renderIdentifierTime()
      td null,
        ColumnDataPreview
          columnName: @props.column.get 'name'
          tableData: @props.dataPreview

  _renderSchemaReferenceSelect: ->
    if @_shouldRenderPart visibleParts.SCHEMA_REFERENCE
      @_createInput
        type: 'select'
        value: @props.column.get 'schemaReference', ''
        disabled: @props.isSaving
        onChange: @_handleInputChange.bind @, 'schemaReference'
      ,
        @_selectOptions(
          @props.referenceableTables
          .set('', '')
        )

  _renderIdentifierLabel: ->
    if @_shouldRenderPart visibleParts.IDENTIFIER_LABEL
      @_createInput
        type: 'text'
        value: @props.column.get 'identifierLabel'
        disabled: @props.isExported || @props.isSaving
        onChange: @_handleInputChange.bind @, 'identifierLabel'

  _renderIdentifierTime: ->
    if @_shouldRenderPart visibleParts.IDENTIFIER_TIME
      @_createInput
        type: 'text'
        value: @props.column.get 'identifierTime'
        disabled: @props.isExported || @props.isSaving
        onChange: @_handleInputChange.bind @, 'identifierTime'

  _renderReferenceSelect: ->
    if @_shouldRenderPart visibleParts.REFERENCE
      @_createInput
        type: 'select'
        disabled: @props.isSaving
        value: @props.column.get 'reference'
        onChange: @_handleInputChange.bind @, 'reference'
      ,
        @_selectOptions(
          @props.referenceableColumns
          .set('', '')
        )

  _renderSortLabelSelect: ->
    return if !@_shouldRenderPart visibleParts.SORT_LABEL
    return if !@props.sortLabelColumns.count() and @props.isEditing
    @_createInput
      type: 'select'
      value: @props.column.get 'sortLabel'
      disabled: @props.isSaving
      onChange: @_handleInputChange.bind @, 'sortLabel'
    ,
      @_selectOptions(
        @props.sortLabelColumns
        .set('', '')
      )


  _renderSortOrderSelect: ->
    return if !@_shouldRenderPart visibleParts.SORT_LABEL
    return if !@props.sortLabelColumns.count() and @props.isEditing
    @_createInput
      type: 'select'
      value: @props.column.get 'sortOrder'
      disable: @props.isSaving
      onChange: @_handleInputChange.bind @, 'sortOrder'
    ,
      @_selectOptions(
        Map(SortOrderOptions)
        .set('', '')
      )

  _renderDataTypeSelect: ->
    if @_shouldRenderPart visibleParts.DATA_TYPE
      span null,
        @_createInput
          type: 'select'
          value: @props.column.get 'dataType'
          disabled: @props.isSaving
          onChange: @_handleInputChange.bind @, 'dataType'
        ,
          @_selectOptions Immutable.fromJS(DataTypes).set('', '')

        if [DataTypes.VARCHAR, DataTypes.DECIMAL].indexOf(@props.column.get 'dataType') >= 0
          @_createInput
            style: {width: '3vw'}
            type: 'text'
            value: @props.column.get 'dataTypeSize'
            disabled: @props.isSaving
            onChange: @_handleInputChange.bind @, 'dataTypeSize'


  _renderDateSelect: ->
    return if !@_shouldRenderPart visibleParts.DATE
    div style: {width: '15vw'},
      @_createInput
        type: 'text'
        value: @props.column.get 'format'
        disabled: @props.isSaving
        onChange: @_handleInputChange.bind @, 'format'
        addonAfter: DateFormatHint() if @props.isEditing
      div {className: 'kbc-form-control-info'},
        'Dimension: '
        strong {},
          @props.column.get 'dateDimension'
        ' '
        if @props.isEditing
          DateDimensionModal
            column: @props.column
            configurationId: @props.configurationId
            onSelect: @_handleDateDimensionSelect

  _handleDateDimensionSelect: (data) ->
    @props.onChange @props.column.set('dateDimension', data.selectedDimension)

  _handleInputChange: (propName, e) ->
    @props.onChange @props.column.set(propName, e.target.value)

  _createInputWithAddon: (props, body) ->
    FormGroup null,
      InputGroup null,
        FormControl props, body
        InputGroupAddon null, props.addonAfter

  _createInput: (props, body) ->
    if @props.isEditing
      if not props.addonAfter
        Input(props, body)
      else
        @_createInputWithAddon(props, body)
    else
      StaticText null, props.value


  _shouldRenderPart: (partName) ->
    allowedPartsForType = switch @props.column.get 'type'
      when ColumnTypes.ATTRIBUTE then [visibleParts.DATA_TYPE, visibleParts.SORT_LABEL, visibleParts.IDENTIFIER_LABEL]
      when ColumnTypes.IGNORE then []
      when ColumnTypes.CONNECTION_POINT then [
        visibleParts.DATA_TYPE,
        visibleParts.SORT_LABEL,
        visibleParts.IDENTIFIER_LABEL
      ]
      when ColumnTypes.DATE then [visibleParts.DATE, visibleParts.IDENTIFIER_TIME]
      when ColumnTypes.FACT then [visibleParts.DATA_TYPE]
      when ColumnTypes.HYPERLINK then [visibleParts.REFERENCE]
      when ColumnTypes.LABEL then [visibleParts.REFERENCE, visibleParts.DATA_TYPE]
      when ColumnTypes.REFERENCE then [visibleParts.SCHEMA_REFERENCE]
      else []

    allowedPartsForType.indexOf(partName) >= 0

  _selectOptions: (options) ->
    options
    .sort()
    .map (value, key) ->
      option
        key: key
        value: key
      ,
        value
    .toArray()

  _isIgnoreType: ->
    @props.column.get('type') == ColumnTypes.IGNORE
