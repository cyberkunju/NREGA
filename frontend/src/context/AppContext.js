import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  selectedDistrict: null,
  performanceData: null,
  districts: [],
  loading: false,
  error: null,
  userLocation: null,
};

// Action types
export const ActionTypes = {
  SET_SELECTED_DISTRICT: 'SET_SELECTED_DISTRICT',
  SET_PERFORMANCE_DATA: 'SET_PERFORMANCE_DATA',
  SET_DISTRICTS: 'SET_DISTRICTS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USER_LOCATION: 'SET_USER_LOCATION',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_STATE: 'RESET_STATE',
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_SELECTED_DISTRICT:
      return {
        ...state,
        selectedDistrict: action.payload,
      };
    
    case ActionTypes.SET_PERFORMANCE_DATA:
      return {
        ...state,
        performanceData: action.payload,
        loading: false,
        error: null,
      };
    
    case ActionTypes.SET_DISTRICTS:
      return {
        ...state,
        districts: action.payload,
      };
    
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case ActionTypes.SET_USER_LOCATION:
      return {
        ...state,
        userLocation: action.payload,
      };
    
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case ActionTypes.RESET_STATE:
      return initialState;
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    setSelectedDistrict: (district) => {
      dispatch({ type: ActionTypes.SET_SELECTED_DISTRICT, payload: district });
    },
    
    setPerformanceData: (data) => {
      dispatch({ type: ActionTypes.SET_PERFORMANCE_DATA, payload: data });
    },
    
    setDistricts: (districts) => {
      dispatch({ type: ActionTypes.SET_DISTRICTS, payload: districts });
    },
    
    setLoading: (loading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
    },
    
    setError: (error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    },
    
    setUserLocation: (location) => {
      dispatch({ type: ActionTypes.SET_USER_LOCATION, payload: location });
    },
    
    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    },
    
    resetState: () => {
      dispatch({ type: ActionTypes.RESET_STATE });
    },
  };

  const value = {
    state,
    actions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
