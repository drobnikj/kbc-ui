React = require('react')
Link = React.createFactory(require('react-router').Link)
Loader = React.createFactory(require('@keboola/indigo-ui').Loader)
ImmutableRenderMixin = require '../../../../../react/mixins/ImmutableRendererMixin'
DeleteQueryButton = React.createFactory require('../../components/DeleteQueryButton')
{i, span, div, a, strong} = React.DOM
_ = require 'underscore'
RunDatePicker = React.createFactory require('../../components/DatePicker')
moment = require 'moment'
RunButtonModal = React.createFactory(require('../../../../components/react/components/RunComponentButton'))
SapiTableLinkEx = React.createFactory(require('../../../../components/react/components/StorageApiTableLinkEx').default)

module.exports = React.createClass
  displayName: 'QueriesTable'
  mixins: [ImmutableRenderMixin]
  propTypes:
    queries: React.PropTypes.object
    profiles: React.PropTypes.object
    config: React.PropTypes.object
    isQueryDeleting: React.PropTypes.func
    # configurationId: number

  getInitialState: ->
    since: moment().subtract(4, 'day')
    until: moment()


  render: ->
    children = @props.queries.map((row, queryName) =>
      Link
        className: 'tr'
        to: 'ex-google-analytics-query'
        key: queryName
        params:
          config: @props.configId
          name: queryName
        div className: 'td', row.get('metrics').join(', ')
        div className: 'td', row.get('dimensions').join(', ')
        div className: 'td kbc-break-all', _.first(row.toJS()?.filters) or 'n/a'
        div className: 'td', row.get('segment') or 'n/a'
        div className: 'td kbc-break-all', @_getProfileName(row.get('profile'))
        div className: 'td',
          i className: 'kbc-icon-arrow-right'
        div className: 'td kbc-break-all',
          SapiTableLinkEx tableId: (@props.config.get('outputBucket') + '.' + queryName)
        div className: 'td text-right kbc-no-wrap',
          if @_isQueryDeleting(queryName)
            Loader()
          else
            DeleteQueryButton
              queryName: queryName
              configurationId: @props.configId

          RunButtonModal
            title: 'Run Single Query Extraction'
            component: 'ex-google-analytics'
            runParams: =>
              config: @props.configId
              since: @state.since.toISOString()
              until: @state.until.toISOString()
              dataset: queryName
          ,
            RunDatePicker
              dateFrom: @state.since
              dateUntil: @state.until
              onChangeFrom: (date) =>
                @setState
                  since: date
              onChangeUntil: (date) =>
                @setState
                  until: date
      ).toArray()

    div className: 'table table-striped table-hover',
      div className: 'thead', key: 'table-header',
        div className: 'tr',
          span className: 'th',
            strong null, 'Metrics'
          span className: 'th',
            strong null, 'Dimensions'
          span className: 'th',
            strong null, 'Filters'
          span className: 'th',
            strong null, 'Segment'
          span className: 'th',
            strong null, 'Profile'
          span className: 'th',""# -> arrow
          span className: 'th',
            strong null, 'Output Table'
          span className: 'th' #actions buttons
      div className: 'tbody',
         children

  _isQueryDeleting: (queryName) ->
    @props.isQueryDeleting queryName

  _getProfileName: (profileId) ->
    profiles = @props.profiles
    if not profileId
      return '--all--'

    profile = profiles.find( (value,key) ->
      value.get('googleId') == profileId
    )
    if profile
      accountName = profile.get('accountName')
      propertyName = profile.get('webPropertyName')
      pname = profile.get('name')
      return "#{accountName}/ #{propertyName}/ #{pname}"
    else
      return "Unknown Profile(#{profileId})"
