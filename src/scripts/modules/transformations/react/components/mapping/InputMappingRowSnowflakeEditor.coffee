React = require 'react'
_ = require('underscore')
Immutable = require('immutable')
{Input} = require('./../../../../../react/common/KbcBootstrap')
Input = React.createFactory Input
Select = React.createFactory require('../../../../../react/common/Select').default
SapiTableSelector = React.createFactory(require('../../../../components/react/components/SapiTableSelector').default)
SnowflakeDataTypesContainer = React.createFactory(require("./input/SnowflakeDataTypesContainer"))

module.exports = React.createClass
  displayName: 'InputMappingRowRedshiftEditor'

  propTypes:
    value: React.PropTypes.object.isRequired
    tables: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired
    disabled: React.PropTypes.bool.isRequired
    initialShowDetails: React.PropTypes.bool.isRequired
    isDestinationDuplicate: React.PropTypes.bool.isRequired

  getInitialState: ->
    showDetails: @props.initialShowDetails

  shouldComponentUpdate: (nextProps, nextState) ->
    should = @props.value != nextProps.value ||
    @props.tables != nextProps.tables ||
    @props.disabled != nextProps.disabled ||
    @state.showDetails != nextState.showDetails

    should

  _handleToggleShowDetails: (e) ->
    @setState(
      showDetails: e.target.checked
    )

  _handleChangeSource: (value) ->
    # use only table name from the table identifier
    destination = value.substr(value.lastIndexOf(".") + 1)
    immutable = @props.value.withMutations (mapping) ->
      mapping = mapping.set("source", value)
      mapping = mapping.set("destination", destination)
      mapping = mapping.set("datatypes", Immutable.Map())
      mapping = mapping.set("whereColumn", "")
      mapping = mapping.set("whereValues", Immutable.List())
      mapping = mapping.set("whereOperator", "eq")
      mapping = mapping.set("columns", Immutable.List())
    @props.onChange(immutable)

  _handleChangeDestination: (e) ->
    value = @props.value.set("destination", e.target.value.trim())
    @props.onChange(value)

  _handleChangeDays: (e) ->
    value = @props.value.set("days", parseInt(e.target.value))
    @props.onChange(value)

  _handleChangeColumns: (newValue) ->
    component = @
    immutable = @props.value.withMutations (mapping) ->
      mapping = mapping.set("columns", newValue)
      if newValue.count()

        columns = mapping.get("columns").toJS()
        if !_.contains(columns, mapping.get("whereColumn"))
          mapping = mapping.set("whereColumn", "")
          mapping = mapping.set("whereValues", Immutable.List())
          mapping = mapping.set("whereOperator", "eq")

        datatypes = _.pick(mapping.get("datatypes").toJS(), columns)
        mapping = mapping.set("datatypes", Immutable.fromJS(datatypes || Immutable.Map()))

    @props.onChange(immutable)

  _handleChangeWhereColumn: (string) ->
    value = @props.value.set("whereColumn", string)
    @props.onChange(value)

  _handleChangeWhereOperator: (e) ->
    value = @props.value.set("whereOperator", e.target.value)
    @props.onChange(value)

  _handleChangeWhereValues: (newValue) ->
    value = @props.value.set("whereValues", newValue)
    @props.onChange(value)

  _handleChangeDataTypes: (datatypes) ->
    value = @props.value.set("datatypes", datatypes)
    @props.onChange(value)

  _getColumns: ->
    if !@props.value.get("source")
      return []
    props = @props
    table = @props.tables.find((table) ->
      table.get("id") == props.value.get("source")
    )
    return [] if !table
    table.get("columns").toJS()

  _getColumnsOptions: ->
    columns = @_getColumns()
    map = _.map(
      columns, (column) ->
        {
          label: column
          value: column
        }
    )

  _getFilteredColumnsOptions: ->
    if @props.value.get("columns", Immutable.List()).count()
      columns = @props.value.get("columns").toJS()
    else
      columns = @_getColumns()
    _.map(
      columns, (column) ->
        {
          label: column
          value: column
        }
    )

  render: ->
    component = @
    React.DOM.div {className: 'form-horizontal clearfix'},
      React.DOM.div {className: "row col-md-12"},
        React.DOM.div className: 'form-group form-group-sm',
          React.DOM.div className: 'col-xs-10 col-xs-offset-2',
            Input
              standalone: true
              type: 'checkbox'
              label: React.DOM.small {}, 'Show details'
              checked: @state.showDetails
              onChange: @_handleToggleShowDetails

      React.DOM.div {className: "row col-md-12"},
        React.DOM.div className: 'form-group',
          React.DOM.label className: 'col-xs-2 control-label', 'Source'
          React.DOM.div className: 'col-xs-10',
            SapiTableSelector
              value: @props.value.get("source")
              disabled: @props.disabled
              placeholder: "Source table"
              onSelectTableFn: @_handleChangeSource
      React.DOM.div {className: "row col-md-12"},
        Input
          type: 'text'
          label: 'Destination'
          value: @props.value.get("destination")
          disabled: @props.disabled
          placeholder: "Destination table name in transformation DB"
          onChange: @_handleChangeDestination
          labelClassName: 'col-xs-2'
          wrapperClassName: 'col-xs-10'
          bsStyle: if @props.isDestinationDuplicate then 'error' else null
          help: if @props.isDestinationDuplicate then React.DOM.small {'className': 'error'},
              'Duplicate destination '
              React.DOM.code {}, @props.value.get("destination")
              '.'
            else null
      if @state.showDetails
        React.DOM.div {className: "row col-md-12"},
          React.DOM.div className: 'form-group form-group-sm',
            React.DOM.label className: 'col-xs-2 control-label', 'Columns'
            React.DOM.div className: 'col-xs-10',
              Select
                multi: true
                name: 'columns'
                value: @props.value.get("columns", Immutable.List()).toJS()
                disabled: @props.disabled || !@props.value.get("source")
                placeholder: "All columns will be imported"
                onChange: @_handleChangeColumns
                options: @_getColumnsOptions()
              React.DOM.div
                className: "help-block"
              ,
                React.DOM.small {}, "Import only specified columns"
      if @state.showDetails
        Input
          bsSize: 'small'
          type: 'number'
          label: 'Days'
          value: @props.value.get("days")
          disabled: @props.disabled
          placeholder: 0
          help: React.DOM.small {},
            "Data updated in the given period"
          onChange: @_handleChangeDays
          labelClassName: 'col-xs-2'
          wrapperClassName: 'col-xs-4'
      if @state.showDetails
        React.DOM.div {className: "row col-md-12"},
          React.DOM.div className: 'form-group form-group-sm',
            React.DOM.label className: 'col-xs-2 control-label', 'Data filter'
            React.DOM.div className: 'col-xs-4',
              Select
                name: 'whereColumn'
                value: @props.value.get("whereColumn")
                disabled: @props.disabled || !@props.value.get("source")
                placeholder: "Select column"
                onChange: @_handleChangeWhereColumn
                options: @_getColumnsOptions()
            React.DOM.div className: 'col-xs-2',
              Input
                bsSize: 'small'
                type: 'select'
                name: 'whereOperator'
                value: @props.value.get("whereOperator")
                disabled: @props.disabled
                onChange: @_handleChangeWhereOperator
              ,
                React.DOM.option {value: "eq"}, "= (IN)"
                React.DOM.option {value: "ne"}, "!= (NOT IN)"
            React.DOM.div className: 'col-xs-4',
              Select
                name: 'whereValues'
                value: @props.value.get('whereValues')
                multi: true
                disabled: @props.disabled
                allowCreate: true
                placeholder: 'Add a value...'
                emptyStrings: true,
                onChange: @_handleChangeWhereValues
      if @state.showDetails
        React.DOM.div {className: "row col-md-12"},
          React.DOM.div className: 'form-group form-group-sm',
            React.DOM.label className: 'col-xs-2 control-label', 'Data types'
            React.DOM.div className: 'col-xs-10',
              SnowflakeDataTypesContainer
                value: @props.value.get("datatypes", Immutable.Map())
                disabled: @props.disabled || !@props.value.get("source")
                onChange: @_handleChangeDataTypes
                columnsOptions: @_getFilteredColumnsOptions()
