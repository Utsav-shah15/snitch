import { createSlice, configureStore } from '@reduxjs/toolkit'

const AuthSlice = createSlice({
  name: 'auth',
  initialState: {
      user:null,
      loading:false,
      error:null
  },
  reducers: {
      setUser:(state,action)=>{
          state.user=action.payload
      },
      setLoading:(state,action)=>{
          state.loading=action.payload
      },
      setError:(state,action)=>{
          state.error=action.payload
      }
    }
})

export const {setUser,setLoading,setError}=AuthSlice.actions;

export default AuthSlice.reducer;