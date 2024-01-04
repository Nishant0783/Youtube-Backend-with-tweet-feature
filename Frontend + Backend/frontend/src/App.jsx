import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';


const App = () => {
  const [jokes, setJokes] = useState([]);
  
  useEffect(()=> {
    axios.get('/api/jokes')
    .then((response)=> {
      setJokes(response.data)
    }).catch((error)=>{
      console.log(error);
    })
  })
  return (
    <>
      <div>Chai or Backend</div>
      <p>Jokes : {jokes.length}</p>
      {jokes.map((joke) => (
        <div key={joke.id}>
          <p>{joke.title}</p>
          <p>{joke.content}</p>
        </div>
      ))}
    </>
  )
}

export default App


