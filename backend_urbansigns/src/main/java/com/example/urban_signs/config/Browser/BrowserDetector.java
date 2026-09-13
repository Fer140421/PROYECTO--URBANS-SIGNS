package com.example.urban_signs.config.Browser;

import org.springframework.stereotype.Component;

@Component
public class BrowserDetector {

    public String detectBrowser(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "Desconocido";
        }

        userAgent = userAgent.toLowerCase();

        if (userAgent.contains("edg/")) {
            return "Edge";
        } else if (userAgent.contains("opr/") || userAgent.contains("opera")) {
            return "Opera";
        } else if (userAgent.contains("chrome")) {
            return "Chrome";
        } else if (userAgent.contains("safari") && !userAgent.contains("chrome")) {
            return "Safari";
        } else if (userAgent.contains("firefox")) {
            return "Firefox";
        } else if (userAgent.contains("msie") || userAgent.contains("trident/")) {
            return "Internet Explorer";
        } else {
            return "Otro navegador";
        }
    }

    public BrowserInfo getBrowserInfo(String userAgent) {
        String browserName = detectBrowser(userAgent);
        String version = extractVersion(userAgent, browserName);
        String os = detectOS(userAgent);

        return new BrowserInfo(browserName, version, os);
    }

    private String extractVersion(String userAgent, String browserName) {
        if (userAgent == null)
            return "Desconocida";

        try {
            String lowerUA = userAgent.toLowerCase();
            String versionPattern = switch (browserName) {
                case "Chrome" -> "chrome/(\\d+\\.\\d+)";
                case "Firefox" -> "firefox/(\\d+\\.\\d+)";
                case "Safari" -> "version/(\\d+\\.\\d+)";
                case "Edge" -> "edg/(\\d+\\.\\d+)";
                case "Opera" -> "opr/(\\d+\\.\\d+)";
                default -> null;
            };

            if (versionPattern != null) {
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(versionPattern);
                java.util.regex.Matcher matcher = pattern.matcher(lowerUA);
                if (matcher.find()) {
                    return matcher.group(1);
                }
            }
        } catch (Exception e) {
            // Ignorar errores
        }

        return "Desconocida";
    }

    private String detectOS(String userAgent) {
        if (userAgent == null)
            return "Desconocido";

        String lowerUA = userAgent.toLowerCase();

        if (lowerUA.contains("windows nt 10.0")) {
            return "Windows 10/11";
        } else if (lowerUA.contains("windows nt 6.3")) {
            return "Windows 8.1";
        } else if (lowerUA.contains("windows nt 6.2")) {
            return "Windows 8";
        } else if (lowerUA.contains("windows nt 6.1")) {
            return "Windows 7";
        } else if (lowerUA.contains("mac os x")) {
            return "macOS";
        } else if (lowerUA.contains("linux")) {
            return "Linux";
        } else if (lowerUA.contains("android")) {
            return "Android";
        } else if (lowerUA.contains("iphone") || lowerUA.contains("ipad")) {
            return "iOS";
        }

        return "Desconocido";
    }

    public record BrowserInfo(String browser, String version, String os) {
        @Override
        public String toString() {
            return String.format("%s %s en %s", browser, version, os);
        }
    }
}