import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { consola } from 'consola';
import { defineConfig, Plugin } from 'vite';

function reactDevtools(): Plugin {
  const virtualModuleId = 'virtual:react-devtools';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

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
          ? await fetch(`http://localhost:8097/`)
              .then((resp) => resp.text())
              .catch(() => {
                consola.info(
                  "React Developer Tools isn't running, restart build after starting React Developer Tools to connect",
                );
                return '';
              })
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
