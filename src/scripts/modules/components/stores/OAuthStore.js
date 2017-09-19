import StoreUtils from '../../../utils/StoreUtils';
import {Map} from 'immutable';
import dispatcher from '../../../Dispatcher';
import Constants from '../OAuthConstants';

var _store = Map({
  deletingCredentials: Map(),
  credentials: Map()
});

var OAuthStore = StoreUtils.createStore({
  hasCredentials: function (componentId, configId) {
    return _store.hasIn(['credentials', componentId, configId]);
  },

  getCredentials: function (componentId, configId) {
    return _store.getIn(['credentials', componentId, configId]);
  },

  isDeletingCredetials: function (componentId, configId) {
    return _store.hasIn(['deletingCredentials', componentId, configId]);
  }
});

dispatcher.register(function (payload) {
  var action = payload.action;

  switch (action.type) {
    case Constants.ActionTypes.OAUTH_LOAD_CREDENTIALS_SUCCESS:
      var credentials = action.credentials;
      _store = _store.setIn(['credentials', action.componentId, action.configId], credentials);
      return OAuthStore.emitChange();

    case Constants.ActionTypes.OAUTH_DELETE_CREDENTIALS_START:
      _store = _store.setIn(['deletingCredentials', action.componentId, action.configId], true);
      return OAuthStore.emitChange();

    case Constants.ActionTypes.OAUTH_DELETE_CREDENTIALS_SUCCESS:
      _store = _store.deleteIn(['deletingCredentials', action.componentId, action.configId]);
      _store = _store.deleteIn(['credentials', action.componentId, action.configId]);
      return OAuthStore.emitChange();

    case Constants.ActionTypes.OAUTH_API_ERROR:
      _store = _store.deleteIn(['deletingCredentials', action.componentId, action.configId]);
      return OAuthStore.emitChange();
  }
});

module.exports = OAuthStore;
