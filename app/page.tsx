"use client";
import { useState } from "react";
 export default function Home(){
  const[weight, setWeight] = useState("");

  return(
    <main style = {{ padding: 40 }}>
      <input
        type = "number"
        placeholder = "体重を入力(kg)"
        value = {weight}
        onChange = {(e) => setWeight( e.target.value )}
        className = "border p-2"
      />

      <p style =  {{ marginTop: 20 }}>
        入力した体重: {weight} kg
      </p>
    </main>
  )
 }