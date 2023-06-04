// import React from 'react

import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
const SearchInput = () => {
  return (
    <div className='flex items-center jusstify-start'>
    <Paper
      component="form"
      className='border-1 shadow-xl'
      sx={{ p: '6px 4px', display: 'flex', alignItems: 'center', width: '100%', borderRadius:"25px"}}
    >
    <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1, color:'GrayText'}}
        placeholder="Search user"
        inputProps={{ 'aria-label': 'Search user' }}
      />
      
    </Paper>
    </div>
  )
  }

export default SearchInput