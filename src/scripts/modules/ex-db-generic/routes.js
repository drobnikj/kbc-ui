import React from 'react';
import IntalledComponentsStore from '../components/stores/InstalledComponentsStore';
import VersionsActionCreators from '../components/VersionsActionCreators';
import ExDbIndex from './react/pages/index/Index';
import ExDbCredentialsPage from './react/pages/credentials/CredentialsPage';
import ExDbNewCredentialsPage from './react/pages/credentials/NewCredentialsPage';
import ExDbQueryDetail from './react/pages/query-detail/QueryDetail';
import ExDbNewQuery from './react/pages/new-query/NewQuery';
import ExDbNewQueryHeaderButtons from './react/components/NewQueryHeaderButtons';
import ExDbQueryHeaderButtons from './react/components/QueryActionButtons';
import ExDbCredentialsHeaderButtons from './react/components/CredentialsHeaderButtons';
import ExDbNewCredentialsHeaderButtons from './react/components/NewCredentialsHeaderButtons';
import ExDbQueryName from './react/components/QueryName';

import createVersionsPageRoute from '../../modules/components/utils/createVersionsPageRoute';

import JobsActionCreators from '../jobs/ActionCreators';
import StorageActionCreators from '../components/StorageActionCreators';

import * as actionsProvisioning from './actionsProvisioning';
import * as storeProvisioning from './storeProvisioning';

import credentialsTemplate from './templates/credentials';
import hasSshTunnel from '../ex-db-generic/templates/hasSshTunnel';

import {createTablesRoute} from '../table-browser/routes';

export default function(componentId) {
  return {
    name: componentId,
    path: ':config',
    isComponent: true,
    requireData: [
      (params) => actionsProvisioning.loadConfiguration(componentId, params.config),
      (params) => VersionsActionCreators.loadVersions(componentId, params.config)
    ],
    title: function(routerState) {
      const configId = routerState.getIn(['params', 'config']);
      return IntalledComponentsStore.getConfig(componentId, configId).get('name');
    },
    poll: {
      interval: 5,
      action: function(params) {
        return JobsActionCreators.loadComponentConfigurationLatestJobs(componentId, params.config);
      }
    },
    defaultRouteHandler: ExDbIndex(componentId),
    childRoutes: [
      createTablesRoute(componentId),
      createVersionsPageRoute(componentId, 'config'),
      {
        name: 'ex-db-generic-' + componentId + '-query',
        path: 'query/:query',
        title: function(routerState) {
          const configId = routerState.getIn(['params', 'config']);
          const queryId = routerState.getIn(['params', 'query']);
          const ExDbStore = storeProvisioning.createStore(componentId, configId);
          return 'Query ' + ExDbStore.getConfigQuery(parseInt(queryId, 10)).get('name');
        },
        nameEdit: function(params) {
          var ExDbQueryNameElement = ExDbQueryName(componentId, storeProvisioning);
          return (
            <ExDbQueryNameElement
              configId={params.config}
              queryId={parseInt(params.query, 10)}
            />
          );
        },
        requireData: [
          () => StorageActionCreators.loadTables()
        ],
        handler: ExDbQueryDetail(componentId, actionsProvisioning, storeProvisioning),
        headerButtonsHandler: ExDbQueryHeaderButtons(componentId, actionsProvisioning, storeProvisioning)
      }, {
        name: 'ex-db-generic-' + componentId + '-new-query',
        path: 'new-query',
        title: function() {
          return 'New query';
        },
        requireData: [
          () => StorageActionCreators.loadTables()
        ],
        handler: ExDbNewQuery(componentId),
        headerButtonsHandler: ExDbNewQueryHeaderButtons(componentId, actionsProvisioning, storeProvisioning)
      }, {
        name: 'ex-db-generic-' + componentId + '-credentials',
        path: 'credentials',
        title: () => 'Credentials',
        handler: ExDbCredentialsPage(
          componentId, actionsProvisioning, storeProvisioning, credentialsTemplate, hasSshTunnel
        ),
        headerButtonsHandler: ExDbCredentialsHeaderButtons(componentId, actionsProvisioning, storeProvisioning)
      }, {
        name: 'ex-db-generic-' + componentId + '-new-credentials',
        path: 'new-credentials',
        title: () => 'New Credentials',
        handler: ExDbNewCredentialsPage(
          componentId, actionsProvisioning, storeProvisioning, credentialsTemplate, hasSshTunnel
        ),
        headerButtonsHandler: ExDbNewCredentialsHeaderButtons(componentId, actionsProvisioning, storeProvisioning)
      }
    ]
  };
}

