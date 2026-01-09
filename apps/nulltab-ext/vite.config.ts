import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, Plugin } from 'vite';

function reactDevtools(): Plugin {
  const virtualModuleId = 'virtual:react-devtools';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  let reactDevtoolsBackendScript: string | null = null;
  async function getReactDevtoolsBackendScript() {
    if (reactDevtoolsBackendScript == null) {
      reactDevtoolsBackendScript = await fetch(`http://localhost:8097/`).then(
        (resp) => resp.text(),
      );
    }
    return reactDevtoolsBackendScript;
  }

  return {
    name: 'react-devtools',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
      return;
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        return this.environment.mode === 'dev'
          ? await getReactDevtoolsBackendScript()
          : '';
      }
      return;
    },
  };
}

export default defineConfig({
  plugins: [
    reactDevtools(),
    devtools(),
    tailwindcss(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
});
