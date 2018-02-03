import React from 'react';
import './Tag.css';

const Tag = (props) => {
  if (props.tag) {
    return (
      <div className="Tag unknown" title={props.tag.name}><span className="text">!</span></div>
    );
  } else {
    return (
      <div className="Tag unknown" title={props.name}><span className="text">?</span></div>
    );
  }
};

export default Tag;
