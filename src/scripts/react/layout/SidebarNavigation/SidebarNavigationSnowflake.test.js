import React from 'react';
import { mount } from 'enzyme';

import SidebarNavigation from '../SidebarNavigation';

SidebarNavigation.contextTypes = {
  router: React.PropTypes.object.isRequired
};

jest.mock('../../../stores/ApplicationStore', () => {
  return {
    hasCurrentProjectFeature: () => {
      return true;
    },
    getProjectPageUrl: (pageId) => {
      return '/' + pageId;
    }
  };
});

jest.mock('../../../stores/RoutesStore', () => {
  return {
    hasRoute: () => {
      return false;
    }
  };
});

const routerContext = {
  router: {
    isActive: function(id) {
      return id === 'extractors';
    }
  }
};

describe('<SidebarNavigation />', function() {
  it('should render snowflake navigation, has not route', function() {
    matchSnapshot(
      mount(<SidebarNavigation />, { context: routerContext })
    );
  });
});
