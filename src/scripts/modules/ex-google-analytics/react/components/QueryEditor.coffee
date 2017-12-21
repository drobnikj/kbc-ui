React = require 'react'
Immutable = require('immutable')
_ = require 'underscore'
_.str = require 'underscore.string'
Input = React.createFactory(require('./../../../../react/common/KbcBootstrap').Input)
SelectCreatable = React.createFactory(require('react-select').Creatable)

{p, div, form, span, option, optgroup, a, label, fieldset} = React.DOM

module.exports = React.createClass
  displayName: 'ExGanalQueryEditor'
  propTypes:
    configId: React.PropTypes.string.isRequired
    query: React.PropTypes.object.isRequired
    profiles: React.PropTypes.object.isRequired
    validation: React.PropTypes.object.isRequired

  render: ->
    div {className: 'container-fluid'},
      div {className: 'kbc-main-content'},
        form className: 'form-horizontal',
          div className: 'row',
            @_createInput 'Name', 'name'
            @_parseUrlInput()
            @_createArraySelect('Metrics', 'metrics')
            @_createArraySelect('Dimensions', 'dimensions')
            @_createInput 'Filters', 'filters'
            @_createInput 'Segment', 'segment'
            @_profilesSelect()

  _parseUrlInput: ->
    plabel = span {},
      'Parse URL from'
      a
        target: '_blank'
        href: 'http://ga-dev-tools.appspot.com/explorer/'
      , ' ga explorer'
    Input
      label: plabel
      type: 'text'
      labelClassName: 'col-xs-4'
      wrapperClassName: 'col-xs-8'
      onChange: (event) =>
        @_parseUrl event.target.value


  _createArraySelect: (caption, propName) ->
    values = @props.query.get(propName, Immutable.List()).toMap()
    valuesForSelect = values.map (item) ->
      {
        label: item,
        value: item
      }
    helpBlock = span className: 'help-block',
      p className: 'text-danger',
        @props.validation.get propName if @props.validation

    div className: 'form-group',
      label className: 'control-label col-xs-4', caption
      div className: 'col-xs-8',
        SelectCreatable
          multi: true
          value: valuesForSelect.toArray()
          placeholder: 'type value and press enter'
          onChange: (stringOptions) =>
            value = stringOptions.map (item) -> item.value
            @props.onChange(@props.query.set(propName, Immutable.fromJS(value)))
        helpBlock


  _profilesSelect: ->
    groups = @props.profiles.groupBy( (profile) ->
      profile.get('accountName') + '/ ' + profile.get('webPropertyName'))
    options = groups.map( (group, groupName) ->
      optgroup
        label: groupName
      ,
        group.map (item) ->
          option
            value: item.get 'googleId'
          ,
            item.get 'name'
    )
    return Input
      label: 'Profiles'
      labelClassName: 'col-xs-4'
      wrapperClassName: 'col-xs-8'
      defaultValue: @props.query.get('profile') or ''
      type: 'select'
      onChange: (event) =>
        value = event.target.value
        if value == ''
          value = null
        @props.onChange(@props.query.set('profile', value))
    ,
      option
        value: ''
      ,
        '--all--'
      options

  _createInput: (caption, propName) ->
    pvalue = @props.query.get(propName)
    Input
      label: caption
      type: 'text'
      value: pvalue
      help: @props.validation.get propName if @props.validation
      bsStyle: 'error' if @props.validation and @props.validation.get(propName)
      labelClassName: 'col-xs-4'
      wrapperClassName: 'col-xs-8'
      onChange: (event) =>
        @props.onChange(@props.query.set(propName, event.target.value))

  _parseUrl: (url) ->
    url = decodeURIComponent(url)
    paramsString = url.split('?')[1] ? ''
    paramsList =  paramsString.split('&')

    parsed = []
    for paramKey,param of paramsList
      key = _.str.strLeft(param,'=') ? ''
      value = _.str.strRight(param,'=') ? ''
      parsed[key] = decodeURIComponent(value)

    metrics = _.map(parsed.metrics.split(','), (metric) ->
      metric = decodeURIComponent(metric)
      metric = metric.replace /ga:/g,''
      metric
    ) if parsed.metrics

    dimensions = _.map(parsed.dimensions.split(','), (dimension) ->
      dimension = decodeURIComponent(dimension)
      dimension = dimension.replace /ga:/g,''
      dimension
    ) if parsed.dimensions

    newQuery = @props.query
    newQuery =  newQuery.set('metrics', Immutable.fromJS(metrics)) if parsed.metrics
    newQuery = newQuery.set('dimensions', Immutable.fromJS(dimensions)) if parsed. dimensions
    newQuery = newQuery.set('filters', parsed.filters) if parsed.filters
    newQuery = newQuery.set('segment', parsed.segment) if parsed.segment
    @props.onChange newQuery
