import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  userInfo: null,
};

const userInfoSlice = createSlice({
  name: 'userInfoSlice',
  initialState: initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
  },
});

export const {setUserInfo} = userInfoSlice.actions;
export default userInfoSlice;
