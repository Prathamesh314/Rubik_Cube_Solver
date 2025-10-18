"use client"
import React from 'react'

const GamePage = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div>
      {loading ? "Loading..." : "GamePage"}
    </div>
  )
}

export default GamePage