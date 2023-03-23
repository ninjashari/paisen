import React from "react"

const Hero = (props) => {


  return (
    <div className="flex items-center justify-center h-screen bg-fixed bg-center bg-cover custom-image">
      {/* Overlay */}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/90 z-[2]" />
      <div className="p-5 text-white z-[2] mt-[-10rem]">
        <h2 className="text-5xl font-bold">{props.heading}</h2>
        <p className="py-5 text-xl">{props.message}</p>
        <button className="px-8 py-2 border">Enter</button>
      </div>
    </div>
  )
}

export default Hero
