import { createContext, useContext } from "react";

export const TermContext = createContext(null);

/** CRT and shell state shared across the app (provided by TermProvider). */
export const useTerm = () => useContext(TermContext);
