import React from 'react';
import './Tag.css';

const Tag = (props) => {
  if (props.tag) {
    return (
      <div className="Tag" title={props.tag.type + ': ' + props.tag.name}><img alt={props.tag.name} src={props.tag.picture} /></div>
    );
  } else {
    return (
      <div className="Tag unknown" title={props.name}><span className="text">?</span></div>
    );
  }
};

export default Tag;
