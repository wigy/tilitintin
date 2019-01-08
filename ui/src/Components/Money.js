import React from 'react';
import PropTypes from 'prop-types';

const Money = (props) => {
  let str;
  switch (props.currency) {
    case 'EUR':
      str = '%s€';
      break;
    default:
      str = '%s ' + props.currency;
  }
  let nums = (Number(props.cents / 100).toFixed(2)).split('.'); nums[0] = nums[0].replace(/(\d+)(\d{9})$/, '$1 $2');
  nums[0] = nums[0].replace(/(\d+)(\d{6})$/, '$1 $2');
  nums[0] = nums[0].replace(/(\d+)(\d{3})$/, '$1 $2');
  let num = nums.join(',');
  str = str.replace('%s', num);
  str = str.replace(/\s/g, '&nbsp;');
  return (<span className="Money" dangerouslySetInnerHTML={{__html: str}}></span>);
};

Money.propTypes = {
  currency: PropTypes.string.isRequired,
  cents: PropTypes.number.isRequired
};

export default Money;
