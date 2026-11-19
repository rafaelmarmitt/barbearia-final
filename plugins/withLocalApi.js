import { withAndroidManifest, withAppBuildGradle } from '@expo/config-plugins';

// Permite o uso didático de API HTTP na rede local. Para publicar, prefira HTTPS.
export default function withLocalApi(config) {
  config = withAndroidManifest(config, mod => {
    mod.modResults.manifest.application[0].$['android:usesCleartextTraffic'] = 'true';
    return mod;
  });

  // Ajustes para o limite de caminhos do Windows na compilação C++ (ninja/CMake):
  // - CMAKE_OBJECT_PATH_MAX encurta os nomes dos objetos gerados;
  // - ANDROID_CXX_DIR (opcional) move a pasta intermediária .cxx para um caminho curto.
  return withAppBuildGradle(config, mod => {
    let gradle = mod.modResults.contents;
    if (!gradle.includes('CMAKE_OBJECT_PATH_MAX')) {
      gradle = gradle.replace(/defaultConfig\s*\{/, 'defaultConfig {\n        externalNativeBuild { cmake { arguments "-DCMAKE_OBJECT_PATH_MAX=230" } }');
    }
    const pastaCurta = process.env.ANDROID_CXX_DIR;
    if (pastaCurta && !gradle.includes('buildStagingDirectory')) {
      const caminho = pastaCurta.replace(/\\/g, '/');
      gradle = gradle.replace(/android\s*\{/, `android {\n    externalNativeBuild { cmake { buildStagingDirectory file('${caminho}') } }`);
    }
    mod.modResults.contents = gradle;
    return mod;
  });
}
