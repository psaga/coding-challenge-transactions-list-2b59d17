// Define the state type
export interface RootState {
  transactions: any[];
  dataTransaction?: any;
  error?: any;
}

// Initial state
const initialState: RootState = {
  transactions: [],
};

const reducer = (state = initialState, action: any): RootState => {
  switch (action.type) {
    case 'SEND_TRANSACTION_SUCCESS':
      return { ...state, dataTransaction: action.data, error: null };
    case 'SEND_TRANSACTION_FAILURE':
      return { ...state, error: action.error };
    default:
      return state;
  }
};

export default reducer;
