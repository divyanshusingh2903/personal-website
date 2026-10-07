import { createContext, useContext } from "react";

export const GlossaryContext = createContext({ isOpen: false, focusId: null, open: () => {}, close: () => {} });
export const useGlossary = () => useContext(GlossaryContext);
