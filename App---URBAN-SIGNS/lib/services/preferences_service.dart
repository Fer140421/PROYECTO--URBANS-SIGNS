import 'package:shared_preferences/shared_preferences.dart';

class PreferencesService {
  final SharedPreferencesAsync _prefs = SharedPreferencesAsync();

  static const _darkModeKey = 'dark_mode';
  static const _apiBaseUrlKey = 'api_base_url';
  static const _authTokenKey = 'auth_token';
  static const _userEmailKey = 'user_email';
  static const _userRolesKey = 'user_roles';

  Future<bool> getDarkMode() async => await _prefs.getBool(_darkModeKey) ?? true;
  Future<void> setDarkMode(bool value) => _prefs.setBool(_darkModeKey, value);

  Future<String?> getApiBaseUrl() => _prefs.getString(_apiBaseUrlKey);
  Future<void> setApiBaseUrl(String url) => _prefs.setString(_apiBaseUrlKey, url);

  Future<String?> getAuthToken() => _prefs.getString(_authTokenKey);
  Future<void> setAuthToken(String token) => _prefs.setString(_authTokenKey, token);

  Future<String?> getUserEmail() => _prefs.getString(_userEmailKey);
  Future<void> setUserEmail(String email) => _prefs.setString(_userEmailKey, email);

  Future<List<String>?> getUserRoles() => _prefs.getStringList(_userRolesKey);
  Future<void> setUserRoles(List<String> roles) => _prefs.setStringList(_userRolesKey, roles);

  Future<void> clearAuth() async {
    await _prefs.remove(_authTokenKey);
    await _prefs.remove(_userEmailKey);
    await _prefs.remove(_userRolesKey);
  }
}
