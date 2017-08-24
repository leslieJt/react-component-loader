/**
 * Created by fed on 2017/8/24.
 */
import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => state['b/list'];
const comp = (props) => <div onClick={() => props.dispatch({
  type: 'aaa'
})}>我是{props.name}啊!</div>;

export default connect(mapStateToProps)(comp);