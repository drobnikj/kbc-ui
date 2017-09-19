import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';

var createUrl = function(path) {
  var baseUrl = 'https://syrup.keboola.com/oauth';
  return baseUrl + '/' + path;
};

var createRequest = function(method, path) {
  return request(method, createUrl(path)).set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());
};

module.exports = {
  getCredentials: function(componentId, configId) {
    return createRequest('GET', 'credentials/' + componentId + '/' + configId).promise().then(function(response) {
      return response.body;
    });
  },

  deleteCredentials: function(componentId, configId) {
    createRequest('DELETE', 'credentials/' + componentId + '/' + configId).promise().then(function(response) {
      return response.body;
    });
  }
};

