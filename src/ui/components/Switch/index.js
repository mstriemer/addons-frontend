import React, { PropTypes } from 'react';
import classNames from 'classnames';

import { getThemeData } from 'disco/themePreview';

import './Switch.scss';

export default class Switch extends React.Component {
  static propTypes = {
    checked: PropTypes.bool,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    progress: PropTypes.number,
    success: PropTypes.bool,
  }

  static defaultProps = {
    checked: false,
    disabled: false,
    onClick: () => {},
    progress: 0,
    success: false,
  }

  handleClick = (e) => {
    e.preventDefault();
    this.props.onClick();
  }

  render() {
    const { checked, className, disabled, label, name, progress, success } = this.props;
    const identifier = `install-button-${name}`;

    const hasProgress = progress !== undefined && progress !== Infinity;
    const classes = classNames('Switch', className, {
      downloading: hasProgress,
      installing: checked && progress === Infinity,
      success,
      uninstalling: !checked && progress === Infinity,
    });

    return (
      <div className={classes} onClick={this.handleClick}
        data-progress={hasProgress ? progress : 0}>
        <input
          id={identifier}
          className="visually-hidden"
          checked={checked}
          disabled={disabled}
          data-browsertheme={JSON.stringify(getThemeData(this.props))}
          ref={(ref) => { this.themeData = ref; }}
          type="checkbox" />
        <label htmlFor={identifier}>
          {progress !== undefined ? <div className="progress" /> : null}
          <span className="visually-hidden">{label}</span>
        </label>
      </div>
    );
  }
}
