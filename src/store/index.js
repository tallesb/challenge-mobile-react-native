import { applyMiddleware, compose, createStore } from 'redux';
import { getStoredState, persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
import createSagaMiddleware from 'redux-saga';

import reducers from './ducks';
import sagas from './sagas';

import { reactotron } from '~/config/ReactotronConfig';

export const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  debounce: 0.1,
  blacklist: ['app', 'characters', 'events', 'series', 'itemDetails'],
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, reducers);
const sagaMonitor = __DEV__ ? reactotron.createSagaMonitor() : null;
const sagaMiddleware = createSagaMiddleware({ sagaMonitor });
const middleware = [];

let composed = applyMiddleware(...middleware, sagaMiddleware);

if (process.env.NODE_ENV !== 'production' || __DEV__) {
  composed = compose(
    applyMiddleware(...middleware, sagaMiddleware),

    reactotron.createEnhancer(),
  );
}

const store = createStore(persistedReducer, composed);
sagaMiddleware.run(sagas);

export const persistor = persistStore(store, null, () => {});

export function startStore() {
  getStoredState(persistConfig, (err, state) => {
    persistor.rehydrate(state);

    persistor.resume();
  });
}

export default store;
