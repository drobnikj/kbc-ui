import {fromJS, Map} from 'immutable';
import OauthActions from './ActionCreators';
import OauthStore from './Store';
// import ComponentsStore from '../components/stores/ComponentsStore';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import installedComponentsStore from '../components/stores/InstalledComponentsStore';
import RouterStore from '../../stores/RoutesStore';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';

const configOauthPath = ['authorization', 'oauth_api', 'id'];

function processRedirectData(componentId, configId, id) {
  // config component configuration
  return installedComponentsActions.loadComponentConfigData(componentId, configId)
    .then( () => {
      const configuration = installedComponentsStore.getConfigData(componentId, configId) || Map();

      // load credentials for componentId and id
      return OauthActions.loadCredentials(componentId, id)
        .then(() => {
          const credentials = OauthStore.getCredentials(componentId, id);
          const newConfiguration = configuration.setIn(configOauthPath, id);

          // save configuration with authorization id
          const saveFn = installedComponentsActions.saveComponentConfigData;
          const authorizedFor = credentials.get('authorizedFor');
          return saveFn(componentId, configId, fromJS(newConfiguration)).then(() => authorizedFor);
        });
    });
}

function redirectToPath(path, params) {
  const router = RouterStore.getRouter();
  router.transitionTo(path, params);
}

function sendNotification(message, type = 'success') {
  const notification = {
    message: message,
    type: type
  };
  ApplicationActionCreators.sendNotification(notification);
}

// create a router route that is redirection from oauth process
// counts on having configIf as config parameter in route params
// @routeName - redirection route name eg 'ex-dropbox-redirect'
// @redirectPathName - path to the route to redirect after success
// process eg. 'ex-dropbox-index'
// @redirectParamsFn - function takes params and returns params for
// redirection to @redirectPathName e.g (params) -> params.config
// @componentId - componentId
export function createRedirectRoute(routeName, redirectPathName, redirectParamsFn, componentId) {
  return {
    name: routeName,
    path: 'oauth-redirect',
    title: 'Authorizing...',
    requireData: [
      (params) => {
        const configId = params.config;
        const cid = componentId || params.component;
        processRedirectData(cid, configId, configId)
          .then((authorizedFor) => {
            const msg = `Account succesfully authorized for ${authorizedFor}`;
            sendNotification(msg);
            redirectToPath(redirectPathName, redirectParamsFn(params));
          });
      }                                                        ]
  };
}

// get credentials id from configData and load credentials
export function loadCredentialsFromConfig(componentId, configId) {
  const configuration = installedComponentsStore.getConfigData(componentId, configId);
  const id = configuration.getIn(configOauthPath);
  if (id) {
    return OauthActions.loadCredentials(componentId, id);
  }
}

// delete credentials and docker configuration object part
export function deleteCredentialsAndConfigAuth(componentId, configId) {
  const configData = installedComponentsStore.getConfigData(componentId, configId);
  const credentialsId = configData.getIn(configOauthPath);
  return OauthActions.deleteCredentials(componentId, credentialsId)
    .then(() => {
      // delete the whole authorization object part of the configuration
      const newConfigData = configData.deleteIn([].concat(configOauthPath[0]));
      const saveFn = installedComponentsActions.saveComponentConfigData;
      return saveFn(componentId, configId, newConfigData);
    });
}

export function getCredentialsId(configData) {
  return configData.getIn(configOauthPath);
}

export function getCredentials(componentId, configId) {
  return OauthStore.getCredentials(componentId, configId);
}