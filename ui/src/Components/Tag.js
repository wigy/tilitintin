import React from 'react';
import PropTypes from 'prop-types';
import TagModel from '../Models/TagModel';
import './Tag.css';
import { Avatar, Chip } from '@material-ui/core';
import { RadioButtonChecked, RadioButtonUnchecked } from '@material-ui/icons';

const Tag = (props) => {
  const { disabled, onClick, tag: { name, url } } = props;

  return (
    <Chip
      avatar={<Avatar src={url}></Avatar>}
      label={name}
      deleteIcon={disabled ? <RadioButtonUnchecked/> : <RadioButtonChecked/>}
      color="secondary"
      variant="outlined"
      clickable
      onDelete={() => {}}
      onClick={() => onClick() }
    />
  );
};

Tag.propTypes = {
  size: PropTypes.string,
  tag: PropTypes.instanceOf(TagModel)
};

export default Tag;
