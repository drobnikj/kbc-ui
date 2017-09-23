import React from 'react';

import JobStatusCircle from './JobStatusCircle';

jest.mock('@keboola/indigo-ui/src/kbc-bootstrap/img/status-green.svg', () => '/status-green.svg');
jest.mock('@keboola/indigo-ui/src/kbc-bootstrap/img/status-grey.svg', () => '/status-grey.svg');
jest.mock('@keboola/indigo-ui/src/kbc-bootstrap/img/status-orange.svg', () => '/status-orange.svg');
jest.mock('@keboola/indigo-ui/src/kbc-bootstrap/img/status-red.svg', () => '/status-red.svg');

jest.mock('../../stores/ApplicationStore', () => {
  return {
    getScriptsBasePath: () => {
      return '/some-path';
    }
  };
});

describe('<JobStatusCircle />', function() {
  it('should render with no props (grey)', function() {
    shallowSnapshot(
      <JobStatusCircle />
    );
  });

  it('should render with status success (green)', function() {
    shallowSnapshot(
      <JobStatusCircle status="success" />
    );
  });

  it('should render with status processing (orange)', function() {
    shallowSnapshot(
      <JobStatusCircle status="processing" />
    );
  });

  it('should render with status error (red)', function() {
    shallowSnapshot(
      <JobStatusCircle status="error" />
    );
  });

  it('should render with status warn (red)', function() {
    shallowSnapshot(
      <JobStatusCircle status="warn" />
    );
  });

  it('should render with status warning (red)', function() {
    shallowSnapshot(
      <JobStatusCircle status="warning" />
    );
  });
});
