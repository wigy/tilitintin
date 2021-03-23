import React from 'react';
import PropTypes from 'prop-types';
import TagModel from '../Models/TagModel';
import { Avatar, Chip } from '@material-ui/core';
import { RadioButtonChecked, RadioButtonUnchecked } from '@material-ui/icons';

const Tag = (props) => {
  const { disabled, onClick, tag: { name, url } } = props;

  return (
    <Chip
      avatar={<Avatar src={url}></Avatar>}
      label={name}
      deleteIcon={disabled ? <RadioButtonUnchecked/> : <RadioButtonChecked/>}
      variant="outlined"
      color="primary"
      clickable
      onDelete={() => {}}
      onClick={() => onClick() }
    />
  );
};

Tag.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  size: PropTypes.string,
  tag: PropTypes.instanceOf(TagModel)
};

export default Tag;
