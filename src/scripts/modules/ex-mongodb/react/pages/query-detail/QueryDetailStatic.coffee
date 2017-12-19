React = require 'react'
CodeEditor  = React.createFactory(require('../../../../../react/common/common').CodeEditor)
Check = React.createFactory(require('@keboola/indigo-ui').Check)
SapiTableLinkEx = React.createFactory(require('../../../../components/react/components/StorageApiTableLinkEx').default)
{div, small, table, tbody, tr, td, ul, li, a, span, h2, p, strong, label, input, textarea} = React.DOM

ExportHelp = React.createFactory require('../../components/ExportHelp').default
LinkToDocs = React.createFactory require('../../components/LinkToDocs').default

Select = React.createFactory(require('react-select'))

module.exports = React.createClass
  displayName: 'ExDbQueryDetailStatic'
  propTypes:
    query: React.PropTypes.object.isRequired
    mode: React.PropTypes.string.isRequired
    componentId: React.PropTypes.string.isRequired
    component: React.PropTypes.object.isRequired

  render: ->
    div className: 'row',
      LinkToDocs documentationUrl: @props.component.get('documentationUrl')

      div className: 'form-horizontal',
        div className: 'form-group',
          label className: 'col-md-2 control-label', 'Name'
          div className: 'col-md-4',
            input
              className: 'form-control'
              type: 'text'
              value: @props.query.get 'name'
              disabled: true

        div className: 'form-group',
          label className: 'col-md-2 control-label', 'Collection'
          div className: 'col-md-4',
            input
              className: 'form-control'
              type: 'text'
              value: @props.query.get 'collection'
              disabled: true

        div className: 'form-group',
          label className: 'col-md-2 control-label', 'Query'
          div className: 'col-md-10',
            CodeEditor
              readOnly: true
              placeholder: 'Not set'
              value:
                if @props.query.get('query') and @props.query.get('query').length
                  @props.query.get 'query'
                else
                  ''
              mode: 'application/json'
              style: {
                width: '100%'
              }

        div className: 'form-group',
          label className: 'col-md-2 control-label', 'Sort'
          div className: 'col-md-10',
            CodeEditor
              readOnly: true
              placeholder: 'Not set'
              value:
                if @props.query.get('sort') and @props.query.get('sort').length
                  @props.query.get 'sort'
                else
                  ''
              mode: 'application/json'
              style: {
                width: '100%'
              }

        div className: 'form-group',
          label className: 'col-md-2 control-label', 'Limit'
          div className: 'col-md-4',
            input
              className: 'form-control'
              placeholder: 'Not set'
              type: 'text'
              disabled: true
              value:
                if @props.query.get('limit')
                  @props.query.get 'limit'
                else
                  ''

        div className: 'form-group',
          label className: 'col-md-2 control-label', 'Incremental'
          div className: 'col-md-4',
            div
              style:
                marginTop: '1em'
                paddingLeft: '1em',
              input
                readOnly: true
                type: 'checkbox'
                checked: @props.query.get 'incremental'

        div className: 'form-group',
          label className: 'col-md-2 control-label', 'Mode'
          div className: 'col-md-4',
            div
              Select
                clearable: false
                disabled: true
                checked: @props.query.get 'incremental'
                value:
                  if @props.query.get('mode')
                    @props.query.get 'mode'
                  else
                    'mapping'
                options: [{label: "Mapping", value: "mapping"}, {label: "Raw", value: "raw"}]

        if (!@props.query.get('mode') or @props.query.get('mode') == 'mapping')
          div className: 'form-group',
            label className: 'col-md-2 control-label', 'Mapping'
            div className: 'col-md-10',
              CodeEditor
                readOnly: true
                value:
                  if @props.query.get('mapping')
                    JSON.stringify(@props.query.get('mapping'), null, 2)
                  else
                    ''
                mode: 'application/json'
