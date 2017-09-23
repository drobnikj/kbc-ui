import React from 'react';
import { mount } from 'enzyme';

import SidebarNavigation from '../SidebarNavigation';

SidebarNavigation.contextTypes = {
  router: React.PropTypes.object.isRequired
};

jest.mock('../../../stores/ApplicationStore', () => {
  return {
    hasCurrentProjectFeature: () => {
      return false;
    },
    getProjectPageUrl: (pageId) => {
      return '/' + pageId;
    }
  };
});

jest.mock('../../../stores/RoutesStore', () => {
  return {
    hasRoute: () => {
      return true;
    }
  };
});

/* eslint-disable react/prop-types */
jest.mock('react-router/lib/components/Link', () => ({ to, children }) => {
  return (
    <a href={to}>{children}</a>
  );
});

const routerContext = {
  router: {
    isActive: function(id) {
      return id === 'extractors';
    }
  }
};

describe('<SidebarNavigation />', function() {
  it('should render standard navigation, has route', function() {
    matchSnapshot(
      mount(<SidebarNavigation />, { context: routerContext })
    );
  });
});
