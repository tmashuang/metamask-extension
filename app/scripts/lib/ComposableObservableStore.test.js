import { ObservableStore } from '@metamask/obs-store';
import ComposableObservableStore from './ComposableObservableStore';

describe('ComposableObservableStore', () => {
  it('should register initial state', () => {
    const store = new ComposableObservableStore('state');
    expect(store.getState()).toStrictEqual('state');
  });

  it('should register initial structure', () => {
    const testStore = new ObservableStore();
    const store = new ComposableObservableStore(null, { TestStore: testStore });
    testStore.putState('state');
    expect(store.getState()).toStrictEqual({ TestStore: 'state' });
  });

  it('should update structure', () => {
    const testStore = new ObservableStore();
    const store = new ComposableObservableStore();
    store.updateStructure({ TestStore: testStore });
    testStore.putState('state');
    expect(store.getState()).toStrictEqual({ TestStore: 'state' });
  });

  it('should return flattened state', () => {
    const fooStore = new ObservableStore({ foo: 'foo' });
    const barStore = new ObservableStore({ bar: 'bar' });
    const store = new ComposableObservableStore(null, {
      FooStore: fooStore,
      BarStore: barStore,
    });
    expect(store.getFlatState()).toStrictEqual({ foo: 'foo', bar: 'bar' });
  });
});
