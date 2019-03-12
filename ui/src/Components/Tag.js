import React from 'react';
import PropTypes from 'prop-types';
import TagModel from '../Models/TagModel';
import './Tag.css';

const Tag = (props) => {
  let classes = 'Tag';
  if (props.size) {
    classes += ' ' + props.size;
  }
  return (
    <div className={classes} title={props.tag.type + ': ' + props.tag.name}><img alt={props.tag.name} src={props.tag.url} /></div>
  );
};

Tag.propTypes = {
  size: PropTypes.string,
  tag: PropTypes.instanceOf(TagModel)
};

export default Tag;
