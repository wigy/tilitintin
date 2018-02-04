import React from 'react';
import './Tag.css';

const Tag = (props) => {
  let ret;
  let classes = "Tag";
  if (props.size) {
    classes += " " + props.size;
  }
  if (props.tag.picture) {
    ret = (
      <div className={classes} title={props.tag.type + ': ' + props.tag.name}><img alt={props.tag.name} src={props.tag.picture} /></div>
    );
  } else {
    ret = (
      <div className={classes + ' unknown'} title={props.tag.tag}><span className="text">?</span></div>
    );
  }
  if (props.tag.toggle !== undefined) {
    ret = (
      <div className="toggle">
        {ret}
      </div>
    );
  }
  return ret;
};

export default Tag;
