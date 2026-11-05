# Build Android

O perfil EAS preview gera APK instalável. A configuração de build não comprova que o APK já foi gerado: consulte VALIDACAO.md para o resultado desta entrega.

## EAS (alternativa sem SDK Android local)

1. Execute `npm ci` e configure EXPO_PUBLIC_API_URL na raiz, ou ajuste a conexão no app depois de instalar.
2. Execute `npx eas-cli login` com sua conta Expo.
3. Execute `npx eas-cli build:configure` se precisar vincular o projeto à conta. Não coloque credenciais na pasta do projeto.
4. Execute `npx eas-cli build --platform android --profile preview`.
5. Baixe o .apk pelo link retornado e registre o commit do código utilizado. Pode haver fila ou exigência de plano conforme sua conta.
6. Instale, configure a URL da API e valide os fluxos com o servidor e MySQL ativos.

## Build local no Windows

Requer JDK compatível, Android SDK e ferramentas compatíveis com o SDK Expo/RN do lockfile. Android Studio inclui JDK em sua pasta jbr. Configure JAVA_HOME e ANDROID_HOME para sua instalação.

No Windows, use uma pasta curta e sem acentos, como `C:\barbearia-agenda`. O Android Gradle Plugin recusa caminhos com caracteres não ASCII. O build também precisa de JDK 17 para compilar os plugins React Native, além da JVM compatível usada pelo Gradle. Se instalado fora dos locais detectados automaticamente, defina JDK17_HOME e use `npm run build:android:local`.

```powershell
npm ci
npx expo prebuild --platform android --no-install
./android/gradlew.bat -p android assembleRelease --no-daemon
```

Saída esperada: `android/app/build/outputs/apk/release/app-release.apk`. O template local usa assinatura de desenvolvimento: adequada à demonstração acadêmica, não constitui configuração de publicação na Play Store. Para publicação, configure uma chave de release privada fora do Git.

Se a geração do template nativo terminar sem MainApplication (falha observada neste Windows), extraia apenas package/android de node_modules/expo/template.tgz para uma pasta temporária, copie esse android para a raiz e rode `npx expo prebuild --platform android --no-install --no-clean`. Não copie App.js nem package.json do template por cima do projeto.

Se a JVM falhar ao estabelecer conexão loopback por caminho temporário longo no Windows, a execução pode definir JAVA_TOOL_OPTIONS com `-Djava.io.tmpdir=C:\jwt-build-temp -Djdk.net.unixdomain.tmpdir=C:\jwt-build-temp`, após criar essa pasta. São opções da sessão de build; não altere configurações globais da máquina sem necessidade.

O plugin plugins/withLocalApi.js permite HTTP local no Android e configura CMAKE_OBJECT_PATH_MAX=128 para encurtar os caminhos de objetos C++ gerados no Windows. O mecanismo de encurtamento é descrito na [documentação do CMake](https://cmake.org/cmake/help/latest/variable/CMAKE_OBJECT_PATH_MAX.html). Não embuta JWT_SECRET ou credenciais do banco no build. A única configuração pública é a URL da API.

## Verificar no aparelho

- Permita instalação da origem usada e instale o APK.
- Configure a conexão com API/MySQL e teste pelo botão Salvar e testar conexão.
- Faça cadastro/login, reserva e cancelamento.
- Feche/reabra o aplicativo para verificar SecureStore e /auth/me.
- Saia e verifique que volta à entrada.
- Entre como admin, crie/edite/exclua vaga livre e confira reserva protegida.
- Desligue a API e verifique mensagem de rede com opção de tentar novamente.
- Repita usando a mesma versão de fontes enviada ao GitHub.
