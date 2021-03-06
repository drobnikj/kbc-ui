React = require 'react'
JobDetail = require('./react/pages/job-detail/JobDetail')
JobsIndex = require('./react/pages/jobs-index/JobsIndex')
JobsActionCreators = require('./ActionCreators')
JobsReloaderButton = require('./react/components/JobsReloaderButton')
JobDetailReloaderButton = require('./react/components/JobDetailReloaderButton')
JobDetailButtons = require './react/components/JobDetailButtons'
JobsStore = require('./stores/JobsStore')
Promise = require('bluebird')
InstalledComponentsActionCreators = require('../components/InstalledComponentsActionCreators')
{createTablesRoute} = require('../table-browser/routes')

routes =
      name: 'jobs'
      title: 'Jobs'
      path: 'jobs'
      defaultRouteHandler: JobsIndex
      reloaderHandler: JobsReloaderButton
      persistQueryParams: ['q']
      poll:
        interval: 10
        action: (params) ->
          JobsActionCreators.reloadJobs()
      requireData: [
        ->
          InstalledComponentsActionCreators.loadComponents()
      ,
        (params, query) ->
          currentQuery = JobsStore.getQuery()
          if params.jobId
            # job detail
            Promise.resolve()
          else if query.q != undefined && query.q != currentQuery
            JobsActionCreators.setQuery(query.q || "")
            JobsActionCreators.loadJobsForce(0, true, false)
          else
            JobsActionCreators.loadJobs()
        ]

      childRoutes: [
        name: 'jobDetail'
        path: ':jobId'
        persistQueryParams: ['q']
        title: (routerState) ->
          jobId = routerState.getIn(['params', 'jobId'])
          "Job " + jobId
        reloaderHandler: JobDetailReloaderButton
        isRunning: (routerState) ->
          jobId = routerState.getIn(['params', 'jobId'])
          job = JobsStore.get parseInt(jobId)
          job && !job.get('isFinished')
        defaultRouteHandler: JobDetail
        headerButtonsHandler: JobDetailButtons
        poll:
          interval: 2
          action: (params) ->
            jobId = parseInt(params.jobId)
            job = JobsStore.get jobId
            if job and job.get('status') in ['waiting','processing','terminating']
              JobsActionCreators.loadJobDetailForce(jobId)
        requireData: [
          (params) ->
            JobsActionCreators.loadJobDetail(parseInt(params.jobId))
        ]
        childRoutes: [ createTablesRoute('jobDetail')]
      ]

module.exports = routes
