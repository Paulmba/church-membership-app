import AsyncStorage from '@react-native-async-storage/async-storage';

let _logout;

export function setLogout(logout) {
  _logout = logout;
}

export async function logout() {
  if (_logout) {
    await _logout();
  }
}
