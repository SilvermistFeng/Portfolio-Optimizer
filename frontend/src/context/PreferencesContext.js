import React, { createContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';

export const PreferencesContext = createContext({
    toggleTheme: () => { },
    isThemeDark: false,
});

export const PreferencesProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isThemeDark, setIsThemeDark] = useState(systemScheme === 'dark');

    const toggleTheme = React.useCallback(() => {
        return setIsThemeDark(!isThemeDark);
    }, [isThemeDark]);

    const preferences = useMemo(
        () => ({
            toggleTheme,
            isThemeDark,
        }),
        [toggleTheme, isThemeDark]
    );

    return (
        <PreferencesContext.Provider value={preferences}>
            {children}
        </PreferencesContext.Provider>
    );
};
