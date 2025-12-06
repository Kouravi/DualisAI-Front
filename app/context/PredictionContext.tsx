"use client";

import React, { createContext, useContext, useState } from 'react'


type Prediction = {
    id?: string
    filename: string
    tipo_modelo: string
    resultado: any
    timestamp?: string
}


type ContextType = {
    history: Prediction[]
    addPrediction: (p: Prediction) => void
}


const PredictionContext = createContext<ContextType | undefined>(undefined)


export const PredictionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<Prediction[]>([])
    const addPrediction = (p: Prediction) => {
        setHistory(prev => [p, ...prev].slice(0, 10)) // keep max 10
    }
    return (
        <PredictionContext.Provider value={{ history, addPrediction }}>
            {children}
        </PredictionContext.Provider>
    )
}


export const usePrediction = () => {
    const ctx = useContext(PredictionContext)
    if (!ctx) throw new Error('usePrediction must be used within PredictionProvider')
    return ctx
}