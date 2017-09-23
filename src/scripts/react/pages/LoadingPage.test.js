import React from 'react';

import LoadingPage from './LoadingPage';

describe('<LoadingPage />', function() {
  it('should render with no props', function() {
    shallowSnapshot(
      <LoadingPage />
    );
  });
});
