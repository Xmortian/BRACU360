// index.js
import { registerRootComponent } from 'expo';
import { enableScreens } from 'react-native-screens';

// ⚡ Enable screens for performance & avoid navigation issues
enableScreens(true);

import App from './App';

registerRootComponent(App);
