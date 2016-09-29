import React from 'react';
import ApplicationStore from '../../../stores/ApplicationStore';
import Graph from './Graph';
import UsageByMonth from './UsageByMonth';

export default React.createClass({

  render() {
    return (
      <div className="container-fluid kbc-main-content">
        <ul className="nav nav-tabs">
          <li role="presentation">
            <a href={this.projectPageUrl('settings-users')}>Users</a>
          </li>
          <li role="presentation">
            <a href={this.projectPageUrl('settings')}>Settings</a>
          </li>
          <li role="presentation">
            <a href={this.projectPageUrl('settings-limits')}>Limits</a>
          </li>
          <li role="presentation" className="active">
            <a href={this.projectPageUrl('settings-billing')}>Billing</a>
          </li>
        </ul>
        <div className="kbc-header">
          <div className="row">
            <div className="col-md-6">
              <Graph/>
            </div>
            <div className="col-md-6">
              <UsageByMonth />
            </div>
          </div>
        </div>
      </div>
    );
  },

  projectPageUrl(path) {
    return ApplicationStore.getProjectPageUrl(path);
  }

});
