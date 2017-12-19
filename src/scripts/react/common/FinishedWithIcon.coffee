React = require 'react'
moment = require 'moment'
Finished = React.createFactory(require('./Finished').default)
date = require '../../utils/date'

{span, i} = React.DOM

FinishedWithIcon = React.createClass
  displayName: 'FinishedWithIcon'
  propTypes:
    endTime: React.PropTypes.string
  render: ->
    span title: date.format(@props.endTime),
      i {className: 'fa fa-calendar'}
      ' '
      Finished
        endTime: @props.endTime


module.exports = FinishedWithIcon
