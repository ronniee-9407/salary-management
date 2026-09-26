import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import salaryReducer, { setFilter, resetFilters } from '../store/salarySlice';

const createStore = () =>
  configureStore({ reducer: { salary: salaryReducer } });

describe('salarySlice reducers', () => {
  it('sets filter values and resets page to 1', () => {
    const store = createStore();
    store.dispatch(setFilter({ search: 'John', departmentId: 3 }));
    const state = store.getState().salary;

    expect(state.filters.search).toBe('John');
    expect(state.filters.departmentId).toBe(3);
    expect(state.filters.page).toBe(1);
  });

  it('resets all filters to initial state', () => {
    const store = createStore();
    store.dispatch(setFilter({ search: 'test', gender: 'Male', page: 5 }));
    store.dispatch(resetFilters());
    const state = store.getState().salary;

    expect(state.filters.search).toBe('');
    expect(state.filters.gender).toBeNull();
    expect(state.filters.page).toBe(1);
    expect(state.filters.sortBy).toBe('id');
  });

  it('preserves other filters when updating one', () => {
    const store = createStore();
    store.dispatch(setFilter({ departmentId: 2 }));
    store.dispatch(setFilter({ countryId: 5 }));
    const state = store.getState().salary;

    expect(state.filters.departmentId).toBe(2);
    expect(state.filters.countryId).toBe(5);
  });
});
