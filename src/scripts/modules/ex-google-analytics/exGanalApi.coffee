request = require('../../utils/request')
_ = require 'underscore'

ApplicationStore = require '../../stores/ApplicationStore'
ComponentsStore = require '../components/stores/ComponentsStore'
Promise = require('bluebird')
#gdriveFilesMocked = require './api-mocks/gdFiles'
#gdConfigMocked  = require './api-mocks/gdConfig'
createUrl = (path) ->
  baseUrl = ComponentsStore.getComponent('ex-google-analytics').get('uri')
  "#{baseUrl}/#{path}"

createRequest = (method, path) ->
  request(method, createUrl(path))
  .timeout(240000)
  .set('X-StorageApi-Token', ApplicationStore.getSapiTokenString())

handleEmptyConfiguration = (response) ->
  config = response?.body
  if not _.isEmpty(config) and _.isEmpty(config.configuration)
    config.configuration = {}
  return config


module.exports =

  getConfig: (configId) ->
    createRequest('GET', 'account/' + configId)
    .promise().then (response) ->
      return handleEmptyConfiguration(response)

  sendLinkEmail: (emailObject) ->
    createRequest('POST', "send-external-link")
    .send(emailObject)
    .promise().then (response) ->
      response.body

  getExtLink: (configId) ->
    data =
      'account': configId
      'referrer': 'https://s3.amazonaws.com/kbc-apps.keboola.com/ex-authorize/index.html#/googleanalytics'
    createRequest('POST', 'external-link')
      .send data
      .promise().then (response) ->
        response.body

  getProfiles: (configId) ->
    createRequest('GET', 'profiles/' + configId)
    .promise().then (response) ->
      response.body

  postProfiles: (configId, profiles) ->
    createRequest('POST', "profiles/#{configId}")
    .send(profiles)
    .promise().then (response) ->
      return response.body

  postOutputBucket: (configId, outbucket) ->
    configData =
      outputBucket: outbucket
    createRequest('POST', "account/#{configId}")
    .send(configData)
    .promise().then (response) ->
      return response.body

  postConfig: (configId, data) ->
    configData =
      configuration: data
    createRequest('POST', "account/#{configId}")
    .send(configData)
    .promise().then (response) ->
      return handleEmptyConfiguration(response)
