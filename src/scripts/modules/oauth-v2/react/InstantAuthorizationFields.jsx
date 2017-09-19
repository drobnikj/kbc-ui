import React, {PropTypes} from 'react';
const CUSTOM_PROPS = {
  'keboola.ex-zendesk': ['subdomain']
};
export default React.createClass({

  propTypes: {
    componentId: PropTypes.string.isRequired,
    setFormValidFn: PropTypes.func
  },

  getInitialState() {
    return {
      authorizedFor: ''
    };
  },

  componentDidMount() {
    this.revalidateForm();
  },

  revalidateForm() {
    this.props.setFormValidFn(this.isValid());
  },

  isValid() {
    const checkProps = CUSTOM_PROPS[this.props.componentId] || [];
    let isCustomValid = true;
    for (let prop of checkProps) {
      isCustomValid = isCustomValid && !!prop;
    }
    return !!this.state.authorizedFor && isCustomValid;
  },

  makeSetStatePropertyFn(prop) {
    return (e) => {
      const val = e.target.value;
      let result = {};
      result[prop] = val;
      this.setState(result);
      this.revalidateForm();
    };
  },

  render() {
    return (
      <div style={{padding: '1.5em 1.5em 0'}}>
        <div className="form-group">
          <label className="control-label col-xs-2">
            Description
          </label>
          <div className="col-xs-10">
            <input
              className="form-control"
              type="text"
              name="authorizedFor"
              defaultValue={this.state.authorizedFor}
              onChange={this.makeSetStatePropertyFn('authorizedFor')}
              autoFocus={true}
            />
            <p className="help-block">
              Describe this authorization, e.g. by the account name.
            </p>
          </div>
        </div>
        {this.renderCustomFields()}
      </div>
    );
  },

  renderCustomFields() {
    if (this.props.componentId === 'keboola.ex-zendesk') {
      return this.renderZendeskFields();
    }
    if (this.props.componentId === 'keboola.ex-google-analytics-v4') {
      return this.renderCredentialsFields();
    }
    return null;
  },

  renderZendeskFields() {
    return [
      <div className="form-group">
        <label className="control-label col-xs-2">
          Domain
        </label>
        <div className="col-xs-10">
          <input
            className="form-control"
            type="text"
            name="zendeskSubdomain"
            defaultValue={this.state.subdomain}
            onChange={this.makeSetStatePropertyFn('subdomain')}
          />
          <p className="help-block">
            Zendes Subdomain, e.g. keboola
          </p>
        </div>
      </div>,
      <input type="hidden" name="userData"
        value={JSON.stringify({subdomain: this.state.subdomain})}/>
    ];
  },

  renderCredentialsFields() {
    return [
      <div className="form-group">
        <label className="control-label col-xs-2">
          Client ID
        </label>
        <div className="col-xs-10">
          <input
            className="form-control"
            type="text"
            name="clientId"
            defaultValue={this.state.clientId}
            onChange={this.makeSetStatePropertyFn('clientId')}
          />
          <p className="help-block">
            Your app Client ID (optional)
          </p>
        </div>
      </div>,
      <div className="form-group">
        <label className="control-label col-xs-2">
          Client Secret
        </label>
        <div className="col-xs-10">
          <input
            className="form-control"
            type="text"
            name="clientSecret"
            defaultValue={this.state.clientSecret}
            onChange={this.makeSetStatePropertyFn('clientSecret')}
          />
          <p className="help-block">
            Your app Client Secret (optional)
          </p>
        </div>
      </div>
    ];
  }
});
