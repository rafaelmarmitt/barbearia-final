import { withAndroidManifest, withAppBuildGradle } from '@expo/config-plugins';
// Permite o uso didático de API HTTP na rede local. Para publicar, prefira HTTPS.
export default function withLocalApi(config) {
  config = withAndroidManifest(config, mod => {
    mod.modResults.manifest.application[0].$['android:usesCleartextTraffic'] = 'true';
    return mod;
  });
  // Encurta nomes dos objetos C++ gerados e evita o limite de caminhos do Ninja no Windows.
  return withAppBuildGradle(config, mod => {
    if (!mod.modResults.contents.includes('CMAKE_OBJECT_PATH_MAX')) {
      mod.modResults.contents = mod.modResults.contents.replace(/defaultConfig\s*\{/, 'defaultConfig {\n        externalNativeBuild { cmake { arguments "-DCMAKE_OBJECT_PATH_MAX=128" } }');
    }
    return mod;
  });
}
