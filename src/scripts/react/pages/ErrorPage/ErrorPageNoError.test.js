import React from 'react';

import ErrorPage from '../ErrorPage';

jest.mock('../../../stores/RoutesStore', () => {
  return {
    getError: () => {
      return {
        getText: () => 'error-text',
        getExceptionId: () => 'error-exception-id'
      };
    }
  };
});

describe('<ErrorPage />', function() {
  it('should render with no props', function() {
    shallowSnapshot(
      <ErrorPage />
    );
  });
});
