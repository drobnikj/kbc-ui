React = require 'react'
JobDetail = require('./react/pages/job-detail/JobDetail.coffee')
JobsIndex = require('./react/pages/jobs-index/JobsIndex.coffee')
JobsActionCreators = require('./ActionCreators.coffee')
JobsReloaderButton = require('./react/components/JobsReloaderButton.coffee')
JobStatusLabel = React.createFactory(require '../../react/common/JobStatusLabel.coffee')
JobsStore = require('./stores/JobsStore.coffee')

routes =
      name:'jobs'
      title: 'Jobs'
      defaultRouteHandler: JobsIndex
      reloaderHandler: JobsReloaderButton
      poll:
        interval: 10
        action: (params) ->
          JobsActionCreators.reloadJobs()
      requireData: [
        (params) ->
          JobsActionCreators.loadJobs()
        ]

      childRoutes: [
        name:'jobDetail'
        path: ':jobId'
        title: (routerState) ->
          jobId = routerState.getIn(['params', 'jobId'])
          job = JobsStore.get jobId
          React.DOM.span null,"Job " + jobId,
            ' '
            JobStatusLabel {status: job.get 'status'}

        handler: JobDetail

        requireData:
          [
            (params) ->
              JobsActionCreators.loadJobDetail(params.jobId)
            ]
        ]

module.exports = routes
