import React, {PropTypes} from 'react';
import Select from 'react-select';
import Immutable from 'immutable';

export default React.createClass({
  propTypes: {
    value: PropTypes.any,
    emptyStrings: PropTypes.bool,
    allowCreate: PropTypes.bool,
    ignoreCase: PropTypes.bool,
    multi: PropTypes.bool,
    matchProp: PropTypes.string,
    labelKey: PropTypes.string,
    valueKey: PropTypes.string,
    matchPos: PropTypes.string,
    help: PropTypes.string,
    delimiter: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    optionRenderer: PropTypes.func,
    filterOption: PropTypes.func
  },

  getDefaultProps() {
    return {
      value: '',
      emptyStrings: false,
      allowCreate: false,
      multi: false,
      ignoreCase: true,
      matchProp: 'any',
      labelKey: 'label',
      valueKey: 'value',
      delimiter: ','
    };
  },

  valueRenderer(value) {
    if (this.props.emptyStrings) {
      if (value[this.props.valueKey] === '%_EMPTY_STRING_%') {
        return (<small><code>[empty string]</code></small>);
      }
      if (value[this.props.valueKey] === '%_SPACE_CHARACTER_%') {
        return (<small><code>[space character]</code></small>);
      }
    }
    // display spaces
    return value[this.props.labelKey].replace(/\s/g, '\xa0');
  },

  filterOptions(options, filterString, values) {
    var exclude = values;
    var opts;
    if (!options) {
      opts = [];
    } else {
      opts = options;
    }
    if (this.props.emptyStrings) {
      var emptyString = {};
      emptyString[this.props.valueKey] = '%_EMPTY_STRING_%';
      emptyString[this.props.labelKey] = (<code>[empty string]</code>);
      opts.push(emptyString);

      var spaceCharacter = {};
      spaceCharacter[this.props.valueKey] = '%_SPACE_CHARACTER_%';
      spaceCharacter[this.props.labelKey] = (<code>[space character]</code>);
      opts.push(spaceCharacter);
    }

    var filterOption = function(op) {
      if (this.props.multi && exclude && Immutable.fromJS(exclude).toMap().find(function(item) {
        return item.get('value') === op.value;
      }, op)) {
        return false;
      }
      if (this.props.filterOption) {
        return this.props.filterOption.call(this, op, filterString);
      }
      var valueTest = String(op.value);
      var labelTest = String(op.label);
      var filterStr = filterString;
      if (this.props.ignoreCase) {
        valueTest = valueTest.toLowerCase();
        labelTest = labelTest.toLowerCase();
        filterStr = filterString.toLowerCase();
      }
      return !filterStr || (this.props.matchPos === 'start') ? (
        (this.props.matchProp !== 'label' && valueTest.substr(0, filterStr.length) === filterStr) ||
        (this.props.matchProp !== 'value' && labelTest.substr(0, filterStr.length) === filterStr)
      ) : (
        (this.props.matchProp !== 'label' && valueTest.indexOf(filterStr) >= 0) ||
        (this.props.matchProp !== 'value' && labelTest.indexOf(filterStr) >= 0)
      );
    };
    return (opts || []).filter(filterOption, this);
  },

  render() {
    if (this.props.allowCreate) {
      return (
        <span>
          <Select.Creatable
            {...this.props}
            value={this.props.value.toJS ? this.mapValues(this.props.value.toJS()) : this.mapValues(this.props.value)}
            valueRenderer={this.valueRenderer}
            filterOptions={this.filterOptions}
            onChange={this.onChange}
          />
          {this.props.help ? (<span className="help-block">{this.props.help}</span>) : null}
        </span>
      );
    } else {
      return (
        <span>
          <Select
            {...this.props}
            value={this.props.value.toJS ? this.mapValues(this.props.value.toJS()) : this.mapValues(this.props.value)}
            valueRenderer={this.valueRenderer}
            filterOptions={this.filterOptions}
            onChange={this.onChange}
          />
          {this.props.help ? (<span className="help-block">{this.props.help}</span>) : null}
        </span>
      );
    }
  },

  onChange(selected) {
    if (this.props.multi) {
      this.props.onChange(Immutable.fromJS(selected.map(function(value) {
        if (value.value === '%_EMPTY_STRING_%') {
          return '';
        }
        if (value.value === '%_SPACE_CHARACTER_%') {
          return ' ';
        }
        return value.value;
      })));
    } else {
      // https://github.com/JedWatson/react-select/issues/1596
      selected && Immutable.fromJS(selected) !== Immutable.List()
        ? this.props.onChange(selected.value)
        : this.props.onChange('');
    }
  },

  mapValues(value) {
    return this.props.multi
      ? this.mapValuesMulti(value)
      : this.mapValuesSingle(value);
  },

  mapValuesSingle(value) {
    if (value) {
      return {
        label: value,
        value: value
      };
    } else {
      return null;
    }
  },

  mapValuesMulti(value) {
    if (value) {
      return value.map(function(item) {
        if (item === '') {
          return {
            label: '%_EMPTY_STRING_%',
            value: '%_EMPTY_STRING_%'
          };
        } else if (item === ' ') {
          return {
            label: '%_SPACE_CHARACTER_%',
            value: '%_SPACE_CHARACTER_%'
          };
        } else {
          return {
            label: item,
            value: item
          };
        }
      });
    } else {
      return [];
    }
  }

});
