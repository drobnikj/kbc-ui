import Promise from 'bluebird';
import dispatcher from '../../Dispatcher';
import oauthStore from './stores/OAuthStore';
import oauthApi from './OAuthApi';
import Constants from './OAuthConstants';
import Immutable from 'immutable';

module.exports = {
  loadCredentials: function(componentId, configId) {
    if (oauthStore.hasCredentials(componentId, configId)) {
      return Promise.resolve();
    }
    return this.loadCredentialsForce(componentId, configId);
  },

  loadCredentialsForce: function(componentId, configId) {
    oauthApi.getCredentials(componentId, configId).then(function(result) {
      dispatcher.handleViewAction({
        type: Constants.ActionTypes.OAUTH_LOAD_CREDENTIALS_SUCCESS,
        componentId: componentId,
        configId: configId,
        credentials: Immutable.fromJS(result)
      });
      return result;
    }).catch(function() {
      dispatcher.handleViewAction({
        type: Constants.ActionTypes.OAUTH_LOAD_CREDENTIALS_ERROR,
        componentId: componentId,
        configId: configId
      });
    });
  },

  deleteCredentials: function(componentId, configId) {
    dispatcher.handleViewAction({
      type: Constants.ActionTypes.OAUTH_DELETE_CREDENTIALS_START,
      componentId: componentId,
      configId: configId
    });
    oauthApi.deleteCredentials(componentId, configId).then(function(result) {
      dispatcher.handleViewAction({
        type: Constants.ActionTypes.OAUTH_DELETE_CREDENTIALS_SUCCESS,
        componentId: componentId,
        configId: configId,
        credentials: result
      });
    }).catch(function() {
      dispatcher.handleViewAction({
        type: Constants.ActionTypes.OAUTH_API_ERROR,
        componentId: componentId,
        configId: configId
      });
    });
  }
};
