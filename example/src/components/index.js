/**
 * Created by fed on 2017/8/24.
 */
import { fork, call } from 'redux-saga/effects';

export default __ROOT_REDUCER__;

const emptySaga = function* emptySaga() {
  yield new Promise(() => {});
};

export function *rootSaga() {
  const sagas = __ROOT_SAGA__.map((saga = emptySaga) => fork(function* wrapperFunc() {
    let error;
    for (let i = 0; i < 100; i++) {
      try {
        yield call(saga);
      } catch (e) {
        error = e;
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error(e);
    }
  }));
  yield sagas;
}