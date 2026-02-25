console.log('--- JS STARTED ---');
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import appConfig from './app.json';

AppRegistry.registerComponent(appConfig.name, () => App);
