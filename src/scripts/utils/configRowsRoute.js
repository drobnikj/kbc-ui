import React from 'react';
import Index from '../react/common/ConfigRows/Index';
import Row from '../react/common/ConfigRows/Row';
import Versions from '../react/common/ConfigRows/Versions';
import installedComponentsActions from '../modules/components/InstalledComponentsActionCreators';
import versionsActions from '../modules/components/VersionsActionCreators';
import rowVersionsActions from '../modules/components/RowVersionsActionCreators';
import jobsActions from '../modules/jobs/ActionCreators';
import InstalledComponentsStore from '../modules/components/stores/InstalledComponentsStore';
import ConfigurationRowsStore from '../modules/components/stores/ConfigurationRowsStore';
import _ from 'lodash';
import fuzzy from 'fuzzy';

// defaults
const defaults = {
  credentials: {
    isCompleted: function() {
      return true;
    }
  },
  row: {
    name: {
      singular: 'Table',
      plural: 'Tables'
    },
    detail: {
      isCompleted: function() {
        return true;
      }
    },
    header: ['Name', 'Description'],
    columns: [
      function(row) {
        return row.get('name') !== '' ? row.get('name') : 'Untitled';
      },
      function(row) {
        return (
          <small>
            {row.get('description') !== '' ? row.get('description') : 'No description'}
          </small>
        );
      }
    ],
    searchFilter: function(row, query) {
      return fuzzy.test(query, row.get('name')) || fuzzy.test(query, row.get('description'));
    }
  }
};

export default function(settings) {
  const settingsWithDefaults = _.defaultsDeep(settings, defaults);
  let route = {
    name: settingsWithDefaults.componentId,
    settings: settingsWithDefaults,
    path: ':config',
    title: (routerState) => {
      const configId = routerState.getIn(['params', 'config']);
      return InstalledComponentsStore.getConfig(settingsWithDefaults.componentId, configId).get('name');
    },
    isComponent: true,
    defaultRouteHandler: Index,
    poll: {
      interval: 10,
      action: (params) => jobsActions.loadComponentConfigurationLatestJobs(settingsWithDefaults.componentId, params.config)
    },
    requireData: [
      (params) => installedComponentsActions.loadComponentConfigData(settingsWithDefaults.componentId, params.config),
      (params) => versionsActions.loadVersions(settingsWithDefaults.componentId, params.config)
    ],
    childRoutes: []
  };
  route.childRoutes.push(
    {
      name: settingsWithDefaults.componentId + '-row',
      settings: settingsWithDefaults,
      path: 'rows/:row',
      title: (routerState) => {
        const configId = routerState.getIn(['params', 'config']);
        const rowId = routerState.getIn(['params', 'row']);
        const configurationRow = ConfigurationRowsStore.get(settingsWithDefaults.componentId, configId, rowId);
        return configurationRow.get('name') !== '' ? configurationRow.get('name') : 'Untitled ' + settingsWithDefaults.row.name.singular;
      },
      requireData: [
        (params) => rowVersionsActions.loadVersions(settingsWithDefaults.componentId, params.config, params.row)
      ],

      defaultRouteHandler: Row,
      childRoutes: [
        {
          name: settingsWithDefaults.componentId + '-row-versions',
          settings: settingsWithDefaults,
          path: 'versions',
          title: 'Versions',
          defaultRouteHandler: Versions
        }
      ]
    }
  );
  return route;
}
