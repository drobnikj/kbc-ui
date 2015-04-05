React = require 'react'
ImmutableRenderMixin = require '../../../../../react/mixins/ImmutableRendererMixin'
_ = require('underscore')
Immutable = require('immutable')
{Input} = require('react-bootstrap')
Input = React.createFactory Input
Select = React.createFactory(require('react-select'))
MySqlIndexesContainer = React.createFactory(require("./MySqlIndexesContainer"))

module.exports = React.createClass
  displayName: 'InputMappingRowMySqlEditor'
  mixins: [ImmutableRenderMixin]

  propTypes:
    value: React.PropTypes.object.isRequired
    tables: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired
    onDelete: React.PropTypes.func.isRequired
    disabled: React.PropTypes.bool.isRequired

  _handleChangeSource: (value) ->
    immutable = @props.value.withMutations (mapping) ->
      mapping = mapping.set("source", value)
      mapping = mapping.set("destination", value)
    @props.onChange(immutable)

  _handleChangeDestination: (e) ->
    value = @props.value.set("destination", e.target.value)
    @props.onChange(value)

  _handleChangeOptional: (e) ->
    value = @props.value.set("optional", e.target.value)
    @props.onChange(value)

  _handleChangeDays: (e) ->
    value = @props.value.set("days", parseInt(e.target.value))
    @props.onChange(value)

  _handleChangeColumns: (string, array) ->
    value = @props.value.set("columns", Immutable.fromJS(_.pluck(array, "value")))
    @props.onChange(value)

  _handleChangeIndexes: (indexes) ->
    value = @props.value.set("indexes", indexes)
    @props.onChange(value)

  _handleChangeWhereColumn: (string) ->
    value = @props.value.set("whereColumn", string)
    @props.onChange(value)

  _handleChangeWhereOperator: (e) ->
    value = @props.value.set("whereOperator", e.target.value)
    @props.onChange(value)

  _handleChangeWhereValues: (e) ->
    value = @props.value.set("whereValues", Immutable.fromJS(e.target.value.split(",")))
    @props.onChange(value)

  _getWhereValues: ->
    @props.value.get("whereValues").join(",")

  _getTables: ->
    props = @props
    _.sortBy(
      _.map(
        _.filter(props.tables.toJS(), (table) ->
          table.bucket.id.substr(0, 3) == "in." || table.bucket.id.substr(0, 4) == "out."
        ), (table) -> {
          label: table.id
          value: table.id
        }
      ), (option) ->
        option.label.toLowerCase()
  )

  _getColumns: ->
    if !@props.value.get("source")
      return []
    props = @props
    table = _.find(
      @props.tables.toJS(), (table) ->
        table.id == props.value.get("source")
    )
    table.columns

  _getColumnsOptions: ->
    columns = @_getColumns()
    _.map(
      columns, (column) ->
        {
          label: column
          value: column
        }
    )

  render: ->
    console.log "render", @props.value.toJS()
    component = @
    React.DOM.div {},
      React.DOM.div {className: "row col-md-12"},
        React.DOM.h5 {}, "Mapping"
      React.DOM.div {className: "row col-md-12"},
        React.DOM.div className: 'form-group',
          React.DOM.label className: 'col-xs-2 control-label', 'Source'
          React.DOM.div className: 'col-xs-10',
            Select
              name: 'source'
              value: @props.value.get("source")
              disabled: @props.disabled
              placeholder: "Source table"
              onChange: @_handleChangeSource
              options: @_getTables()
      React.DOM.div {className: "row col-md-12"},
        Input
          type: 'checkbox'
          label: 'Optional'
          value: @props.value.get("optional")
          disabled: @props.disabled
          onChange: @_handleChangeOptional
          wrapperClassName: 'col-xs-offset-2 col-xs-10'
          help: "If this table does not exist in Storage, the transformation won't show an error."
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

      React.DOM.div {className: "row col-md-12"},
        React.DOM.h5 {}, "Data Filters"

      React.DOM.div {className: "row col-md-12"},
        React.DOM.div className: 'form-group',
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
              "Import only specified columns"
        Input
          type: 'number'
          label: 'Days'
          value: @props.value.get("days")
          disabled: @props.disabled
          placeholder: 0
          help: "Data updated in the given period"
          onChange: @_handleChangeDays
          labelClassName: 'col-xs-2'
          wrapperClassName: 'col-xs-4'
      React.DOM.div {className: "row col-md-12"},
        React.DOM.div className: 'form-group',
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
              type: 'select'
              name: 'whereOperator'
              value: @props.value.get("whereOperator")
              disabled: @props.disabled
              onChange: @_handleChangeWhereOperator
            ,
              React.DOM.option {value: "eq"}, "= (IN)"
              React.DOM.option {value: "ne"}, "!= (NOT IN)"
          React.DOM.div className: 'col-xs-4',
            Input
              type: 'text'
              name: 'whereValues'
              value: @_getWhereValues()
              disabled: @props.disabled
              onChange: @_handleChangeWhereValues
              placeholder: "Comma separated values"

      React.DOM.div {className: "row col-md-12"},
        React.DOM.h5 {}, "Indexes"
      React.DOM.div {className: "row col-md-12"},
        React.DOM.div className: 'form-group',
          React.DOM.label className: 'col-xs-2 control-label', 'Indexes'
          React.DOM.div className: 'col-xs-10',
            MySqlIndexesContainer
              value: @props.value.get("indexes", Immutable.List())
              disabled: @props.disabled || !@props.value.get("source")
              onChange: @_handleChangeIndexes
              columnsOptions: @_getColumnsOptions()

      React.DOM.div {className: "row col-md-12"},
        React.DOM.h5 {}, "Data Types"

      React.DOM.div {className: "row col-md-12 text-right"},
        React.DOM.button
          className: "btn btn-danger"
          onClick: (e) ->
            component.props.onDelete()
            e.preventDefault()
        ,
          " Delete input mapping"
