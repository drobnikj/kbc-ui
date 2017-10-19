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
      <div className="container-fluid">
        <div className="row">
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
        </div>
        <div className="row">
          {this.renderCustomFields()}
        </div>
      </div>
    );
  },

  renderCustomFields() {
    if (this.props.componentId === 'keboola.ex-zendesk') {
      return this.renderZendeskFields();
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
  }
});
